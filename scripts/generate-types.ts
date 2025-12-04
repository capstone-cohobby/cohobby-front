import * as fs from 'fs';
import * as path from 'path';

// Java 타입을 TypeScript 타입으로 매핑
const typeMapping: Record<string, string> = {
  'Long': 'number',
  'Integer': 'number',
  'Short': 'number',
  'Byte': 'number',
  'Double': 'number',
  'Float': 'number',
  'String': 'string',
  'Boolean': 'boolean',
  'LocalDateTime': 'string', // ISO date string
  'LocalDate': 'string', // ISO date string
  'List': 'Array',
  'Set': 'Array',
  'ArrayList': 'Array',
  'LinkedHashSet': 'Array',
};

// Java 파일에서 엔티티 정보 추출
function parseJavaEntity(filePath: string): {
  className: string;
  fields: Array<{ name: string; type: string; optional: boolean; isArray: boolean; isEnum: boolean }>;
  enums: string[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const className = content.match(/public class (\w+)/)?.[1] || '';
  
  const fields: Array<{ name: string; type: string; optional: boolean; isArray: boolean; isEnum: boolean }> = [];
  const enums: string[] = [];

  // 모든 필드 선언 찾기 (더 정확한 패턴)
  const fieldRegex = /(@\w+(?:\([^)]*\))?\s*)*private\s+(?:final\s+)?(?:List<(\w+)>|Set<(\w+)>|(\w+))\s+(\w+);/g;
  let match;
  
  while ((match = fieldRegex.exec(content)) !== null) {
    const annotations = match[1] || '';
    const genericType = match[2] || match[3];
    const simpleType = match[4];
    const fieldName = match[5];
    
    // 관계 필드 제외 (OneToMany, ManyToOne 등은 API 응답에 포함되지 않을 수 있음)
    if (annotations.includes('@OneToMany') || 
        annotations.includes('@ManyToOne') || 
        annotations.includes('@OneToOne') ||
        annotations.includes('@ManyToMany')) {
      continue;
    }

    let tsType = '';
    let isArray = false;
    let isEnum = false;

    if (genericType) {
      // List<Type> or Set<Type>
      const mappedType = typeMapping[genericType] || genericType;
      tsType = mappedType;
      isArray = true;
    } else if (simpleType) {
      // 단순 타입
      if (typeMapping[simpleType]) {
        tsType = typeMapping[simpleType];
      } else {
        // 커스텀 타입 (다른 엔티티나 Enum)
        tsType = simpleType;
        // Enum 체크
        if (annotations.includes('@Enumerated')) {
          isEnum = true;
          enums.push(simpleType);
        }
      }
    }

    // nullable 체크 - @Column 어노테이션 확인
    const columnMatch = annotations.match(/@Column\([^)]*\)/);
    let nullable = true; // 기본값은 optional
    if (columnMatch) {
      const columnContent = columnMatch[0];
      if (columnContent.includes('nullable = false')) {
        nullable = false;
      } else if (columnContent.includes('nullable = true')) {
        nullable = true;
      } else if (columnContent.includes('nullable')) {
        // nullable 속성이 있으면 그 값 사용
        nullable = !columnContent.includes('nullable = false');
      }
    } else {
      // @Column이 없으면 optional로 처리
      nullable = true;
    }

    // ID 필드는 보통 optional (API 응답에서만 필요할 수 있음)
    if (fieldName.toLowerCase().includes('id') && fieldName !== 'id') {
      nullable = true;
    }

    fields.push({
      name: fieldName,
      type: tsType,
      optional: nullable,
      isArray,
      isEnum,
    });
  }

  return { className, fields, enums };
}

// Enum 파일 파싱
function parseJavaEnum(filePath: string): { enumName: string; values: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const enumName = content.match(/public enum (\w+)/)?.[1] || '';
  const values: string[] = [];
  
  // Enum 값 추출 - 더 정확한 패턴
  // 예: MALE("MALE"), FEMALE("FEMALE");
  const enumBodyMatch = content.match(/public enum \w+\s*\{([\s\S]+?)\}/);
  if (enumBodyMatch) {
    const enumBody = enumBodyMatch[1];
    // 각 enum 값 추출
    const valuePattern = /(\w+)\s*(?:\([^)]*\))?\s*(?:,|;)/g;
    let valueMatch;
    while ((valueMatch = valuePattern.exec(enumBody)) !== null) {
      const value = valueMatch[1];
      if (value && 
          value !== enumName && 
          !['private', 'public', 'static', 'final', 'String', 'value'].includes(value) &&
          !values.includes(value)) {
        values.push(value);
      }
    }
  }
  
  return { enumName, values };
}

// camelCase 변환 헬퍼
function toCamelCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// TypeScript 타입 생성
function generateTypeScriptType(
  className: string,
  fields: Array<{ name: string; type: string; optional: boolean; isArray: boolean; isEnum: boolean }>,
  baseEntityFields: string[] = []
): string {
  const fieldStrings = fields.map(field => {
    const optional = field.optional ? '?' : '';
    let type = field.type;
    
    if (field.isArray) {
      type = `${type}[]`;
    } else if (field.isEnum) {
      // Enum은 string으로 처리 (실제 enum 값은 별도로 정의)
      type = 'string';
    }
    
    // camelCase 변환
    const camelName = toCamelCase(field.name);
    
    return `  ${camelName}${optional}: ${type};`;
  });

  // BaseTimeEntity 필드 추가
  if (baseEntityFields.length > 0) {
    baseEntityFields.forEach(field => {
      if (!fieldStrings.some(f => f.includes(field))) {
        fieldStrings.push(`  ${field}?: string;`);
      }
    });
  }

  return `export interface ${className} {
${fieldStrings.join('\n')}
}`;
}

// 메인 함수
function main() {
  const springServerPath = path.join(__dirname, '../../cohhoby-server/cohobby/src/main/java');
  const outputPath = path.join(__dirname, '../lib/api/types/generated');

  // 출력 디렉토리 생성
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // 엔티티 파일 찾기
  const entityFiles: string[] = [];
  const enumFiles: string[] = [];

  function findJavaFiles(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findJavaFiles(filePath);
      } else if (file.endsWith('.java')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('@Entity') || content.includes('public class') && content.includes('extends BaseTimeEntity')) {
          entityFiles.push(filePath);
        } else if (content.includes('public enum')) {
          enumFiles.push(filePath);
        }
      }
    }
  }

  findJavaFiles(springServerPath);

  console.log(`Found ${entityFiles.length} entity files`);
  console.log(`Found ${enumFiles.length} enum files`);

  // Enum 타입 생성
  const enumTypes: Record<string, string[]> = {};
  for (const enumFile of enumFiles) {
    try {
      const { enumName, values } = parseJavaEnum(enumFile);
      if (enumName && values.length > 0) {
        enumTypes[enumName] = values;
      }
    } catch (error) {
      console.error(`Error parsing enum ${enumFile}:`, error);
    }
  }

  // Enum 타입 파일 생성
  const enumTypeContent = Object.entries(enumTypes)
    .map(([enumName, values]) => {
      const valueStrings = values.map(v => `  ${v} = '${v}'`).join(',\n');
      return `export enum ${enumName} {\n${valueStrings}\n}`;
    })
    .join('\n\n');

  if (enumTypeContent) {
    fs.writeFileSync(path.join(outputPath, 'enums.ts'), enumTypeContent);
    console.log('Generated enums.ts');
  }

  // 엔티티 타입 생성
  const baseEntityFields = ['createdAt', 'updatedAt'];
  const typeDefinitions: string[] = [];

  for (const entityFile of entityFiles) {
    try {
      const { className, fields } = parseJavaEntity(entityFile);
      if (className && fields.length > 0) {
        const extendsBaseTime = fs.readFileSync(entityFile, 'utf-8').includes('extends BaseTimeEntity');
        const tsType = generateTypeScriptType(
          className,
          fields,
          extendsBaseTime ? baseEntityFields : []
        );
        typeDefinitions.push(tsType);
        console.log(`Generated type for ${className}`);
      }
    } catch (error) {
      console.error(`Error parsing entity ${entityFile}:`, error);
    }
  }

  // 모든 타입을 하나의 파일로 저장
  const allTypesContent = `// Auto-generated types from Spring Boot entities
// DO NOT EDIT THIS FILE MANUALLY
// Run: npm run generate-types

${typeDefinitions.join('\n\n')}
`;

  fs.writeFileSync(path.join(outputPath, 'entities.ts'), allTypesContent);
  console.log(`\n✅ Generated ${typeDefinitions.length} entity types`);
  console.log(`📁 Output: ${outputPath}`);
}

main();

