const departments = [
  'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso', 'Escuintla',
  'Guatemala', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Peten', 'Quetzaltenango',
  'Quiche', 'Retalhuleu', 'Sacatepequez', 'San Marcos', 'Santa Rosa', 'Solola', 'Suchitepequez',
  'Totonicapan', 'Zacapa'
];

const municipalities = {
  'Alta Verapaz': ['Coban', 'Santa Cruz Verapaz', 'San Cristobal Verapaz', 'Tactic', 'Tamahú', 'Tucuru', 'Panzos', 'Senahu', 'San Pedro Carcha', 'San Juan Chamelco', 'Lanquín', 'Cahabon', 'Chisec', 'Chahal', 'Fray Bartolome de las Casas', 'Santa Catalina La Tinta', 'Raxruha'],
  'Baja Verapaz': ['Salama', 'San Miguel Chicaj', 'Rabinal', 'Cubulco', 'Granados', 'Santa Cruz El Chol', 'San Jeronimo', 'Purulha'],
  Chimaltenango: ['Chimaltenango', 'San Jose Poaquil', 'San Martin Jilotepeque', 'San Juan Comalapa', 'Santa Apolonia', 'Tecpan Guatemala', 'Patzun', 'Pochuta', 'Patzicia', 'Santa Cruz Balanya', 'Acatenango', 'Yepocapa', 'San Andres Itzapa', 'Parramos', 'Zaragoza', 'El Tejar'],
  Chiquimula: ['Chiquimula', 'San Jose La Arada', 'San Juan Ermita', 'Jocotan', 'Camotan', 'Olopa', 'Esquipulas', 'Concepcion Las Minas', 'Quezaltepeque', 'San Jacinto', 'Ipala'],
  'El Progreso': ['Guastatoya', 'Morazan', 'San Agustin Acasaguastlan', 'San Cristobal Acasaguastlan', 'El Jicaro', 'Sansare', 'Sanarate', 'San Antonio La Paz'],
  Escuintla: ['Escuintla', 'Santa Lucia Cotzumalguapa', 'La Democracia', 'Siquinala', 'Masagua', 'Tiquisate', 'La Gomera', 'Guanagazapa', 'San Jose', 'Iztapa', 'Palin', 'San Vicente Pacaya', 'Nueva Concepcion'],
  Guatemala: ['Guatemala', 'Santa Catarina Pinula', 'San Jose Pinula', 'San Jose del Golfo', 'Palencia', 'Chinautla', 'San Pedro Ayampuc', 'Mixco', 'San Pedro Sacatepequez', 'San Juan Sacatepequez', 'San Raymundo', 'Chuarrancho', 'Fraijanes', 'Amatitlan', 'Villa Nueva', 'Villa Canales', 'San Miguel Petapa'],
  Huehuetenango: ['Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco', 'Nenton', 'San Pedro Necta', 'Jacaltenango', 'Soloma', 'Ixtahuacan', 'Santa Barbara', 'La Libertad', 'La Democracia', 'San Miguel Acatan', 'San Rafael La Independencia', 'Todos Santos Cuchumatan', 'San Juan Atitan', 'Santa Eulalia', 'San Mateo Ixtatan', 'Colotenango', 'San Sebastian Huehuetenango', 'Tectitan', 'Concepcion Huista', 'San Juan Ixcoy', 'San Antonio Huista', 'San Sebastian Coatan', 'Santa Cruz Barillas', 'Aguacatan', 'San Rafael Petzal', 'San Gaspar Ixchil', 'Santiago Chimaltenango', 'Santa Ana Huista', 'Union Cantinil'],
  Izabal: ['Puerto Barrios', 'Livingston', 'El Estor', 'Morales', 'Los Amates'],
  Jalapa: ['Jalapa', 'San Pedro Pinula', 'San Luis Jilotepeque', 'San Manuel Chaparron', 'San Carlos Alzatate', 'Monjas', 'Mataquescuintla'],
  Jutiapa: ['Jutiapa', 'El Progreso', 'Santa Catarina Mita', 'Agua Blanca', 'Asuncion Mita', 'Yupiltepeque', 'Atescatempa', 'Jerez', 'El Adelanto', 'Zapotitlan', 'Comapa', 'Jalpatagua', 'Conguaco', 'Moyuta', 'Pasaco', 'San Jose Acatempa', 'Quesada'],
  Peten: ['Flores', 'San Jose', 'San Benito', 'San Andres', 'La Libertad', 'San Francisco', 'Santa Ana', 'Dolores', 'San Luis', 'Sayaxche', 'Melchor de Mencos', 'Poptun', 'Las Cruces', 'El Chal'],
  Quetzaltenango: ['Quetzaltenango', 'Salcaja', 'Olintepeque', 'San Carlos Sija', 'Sibilia', 'Cabrican', 'Cajola', 'San Miguel Siguila', 'San Juan Ostuncalco', 'San Mateo', 'Concepcion Chiquirichapa', 'San Martin Sacatepequez', 'Almolonga', 'Cantel', 'Huitan', 'Zunil', 'Colomba', 'San Francisco La Union', 'El Palmar', 'Coatepeque', 'Genova', 'Flores Costa Cuca', 'La Esperanza', 'Palestina de Los Altos'],
  Quiche: ['Santa Cruz del Quiche', 'Chiche', 'Chinique', 'Zacualpa', 'Chajul', 'Chichicastenango', 'Patzite', 'San Antonio Ilotenango', 'San Pedro Jocopilas', 'Cunen', 'San Juan Cotzal', 'Joyabaj', 'Nebaj', 'San Andres Sajcabaja', 'Uspantan', 'Sacapulas', 'San Bartolome Jocotenango', 'Canilla', 'Chicaman', 'Ixcan', 'Pachalum'],
  Retalhuleu: ['Retalhuleu', 'San Sebastian', 'Santa Cruz Mulua', 'San Martin Zapotitlan', 'San Felipe', 'San Andres Villa Seca', 'Champerico', 'Nuevo San Carlos', 'El Asintal'],
  Sacatepequez: ['Antigua Guatemala', 'Jocotenango', 'Pastores', 'Sumpango', 'Santo Domingo Xenacoj', 'Santiago Sacatepequez', 'San Bartolome Milpas Altas', 'San Lucas Sacatepequez', 'Santa Lucia Milpas Altas', 'Magdalena Milpas Altas', 'Santa Maria de Jesus', 'Ciudad Vieja', 'San Miguel Dueñas', 'Alotenango', 'San Antonio Aguas Calientes', 'Santa Catarina Barahona'],
  'San Marcos': ['San Marcos', 'San Pedro Sacatepequez', 'San Antonio Sacatepequez', 'Comitancillo', 'San Miguel Ixtahuacan', 'Concepcion Tutuapa', 'Tacana', 'Sibinal', 'Tajumulco', 'Tejutla', 'San Rafael Pie de la Cuesta', 'Nuevo Progreso', 'El Tumbador', 'San Jose El Rodeo', 'Malacatan', 'Catarina', 'Ayutla', 'Ocos', 'San Pablo', 'El Quetzal', 'La Reforma', 'Pajapita', 'Ixchiguan', 'San Jose Ojetenam', 'San Cristobal Cucho', 'Sipacapa', 'Esquipulas Palo Gordo', 'Rio Blanco', 'San Lorenzo', 'La Blanca'],
  'Santa Rosa': ['Cuilapa', 'Barberena', 'Santa Rosa de Lima', 'Casillas', 'San Rafael Las Flores', 'Oratorio', 'San Juan Tecuaco', 'Chiquimulilla', 'Taxisco', 'Santa Maria Ixhuatan', 'Guazacapan', 'Santa Cruz Naranjo', 'Pueblo Nuevo Viñas', 'Nueva Santa Rosa'],
  Solola: ['Solola', 'San Jose Chacaya', 'Santa Maria Visitacion', 'Santa Lucia Utatlan', 'Nahuala', 'Santa Catarina Ixtahuacan', 'Santa Clara La Laguna', 'Concepcion', 'San Andres Semetabaj', 'Panajachel', 'Santa Catarina Palopo', 'San Antonio Palopo', 'San Lucas Toliman', 'Santa Cruz La Laguna', 'San Pablo La Laguna', 'San Marcos La Laguna', 'San Juan La Laguna', 'San Pedro La Laguna', 'Santiago Atitlan'],
  Suchitepequez: ['Mazatenango', 'Cuyotenango', 'San Francisco Zapotitlan', 'San Bernardino', 'San Jose El Idolo', 'Santo Domingo Suchitepequez', 'San Lorenzo', 'Samayac', 'San Pablo Jocopilas', 'San Antonio Suchitepequez', 'San Miguel Panan', 'San Gabriel', 'Chicacao', 'Patulul', 'Santa Barbara', 'San Juan Bautista', 'Santo Tomas La Union', 'Zunilito', 'Pueblo Nuevo', 'Rio Bravo'],
  Totonicapan: ['Totonicapan', 'San Cristobal Totonicapan', 'San Francisco El Alto', 'San Andres Xecul', 'Momostenango', 'Santa Maria Chiquimula', 'Santa Lucia La Reforma', 'San Bartolo'],
  Zacapa: ['Zacapa', 'Estanzuela', 'Rio Hondo', 'Gualan', 'Teculutan', 'Usumatlan', 'Cabañas', 'San Diego', 'La Union', 'Huite']
};

export class LocationBranchSeed1725494400000 {
  name = 'LocationBranchSeed1725494400000';

  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE TB_DEPARTMENT (
      ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      NAME VARCHAR2(100) NOT NULL UNIQUE,
      STATUS VARCHAR2(2) DEFAULT 'E' NOT NULL,
      CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
      UPDATED_AT TIMESTAMP
    )`);

    await queryRunner.query(`CREATE TABLE TB_MUNICIPALITY (
      ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      NAME VARCHAR2(120) NOT NULL,
      ID_DEPARTMENT NUMBER NOT NULL,
      STATUS VARCHAR2(2) DEFAULT 'E' NOT NULL,
      CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
      UPDATED_AT TIMESTAMP,
      CONSTRAINT FK_MUNICIPALITY_DEPARTMENT FOREIGN KEY (ID_DEPARTMENT) REFERENCES TB_DEPARTMENT(ID),
      CONSTRAINT UK_MUNICIPALITY_DEPARTMENT UNIQUE (NAME, ID_DEPARTMENT)
    )`);

    await queryRunner.query(`CREATE TABLE TB_BRANCH (
      ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      NAME VARCHAR2(100) NOT NULL,
      PHONE VARCHAR2(20),
      EMAIL VARCHAR2(120),
      ADDRESS VARCHAR2(150),
      ID_DEPARTMENT NUMBER,
      ID_MUNICIPALITY NUMBER,
      COMPANY_ID NUMBER,
      STATUS VARCHAR2(2) DEFAULT 'E' NOT NULL,
      CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
      UPDATED_AT TIMESTAMP,
      CREATED_BY NUMBER,
      UPDATED_BY NUMBER,
      CONSTRAINT FK_BRANCH_COMPANY FOREIGN KEY (COMPANY_ID) REFERENCES TB_COMPANY(ID),
      CONSTRAINT FK_BRANCH_DEPARTMENT FOREIGN KEY (ID_DEPARTMENT) REFERENCES TB_DEPARTMENT(ID),
      CONSTRAINT FK_BRANCH_MUNICIPALITY FOREIGN KEY (ID_MUNICIPALITY) REFERENCES TB_MUNICIPALITY(ID)
    )`);

    await queryRunner.query('ALTER TABLE TB_EMPLOYEE ADD BRANCH_ID NUMBER');
    await queryRunner.query('ALTER TABLE TB_EMPLOYEE MODIFY COMPANY_ID NULL');
    await queryRunner.query('ALTER TABLE TB_EMPLOYEE ADD CONSTRAINT FK_EMPLOYEE_BRANCH FOREIGN KEY (BRANCH_ID) REFERENCES TB_BRANCH(ID)');

    for (const department of departments) {
      await queryRunner.query(`INSERT INTO TB_DEPARTMENT (NAME, STATUS, CREATED_AT) VALUES ('${department}', 'E', SYSTIMESTAMP)`);
    }

    for (const [department, names] of Object.entries(municipalities)) {
      for (const municipality of names) {
        await queryRunner.query(`INSERT INTO TB_MUNICIPALITY (NAME, ID_DEPARTMENT, STATUS, CREATED_AT)
          SELECT '${municipality}', ID, 'E', SYSTIMESTAMP FROM TB_DEPARTMENT WHERE NAME = '${department}'`);
      }
    }
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE TB_EMPLOYEE DROP CONSTRAINT FK_EMPLOYEE_BRANCH');
    await queryRunner.query('ALTER TABLE TB_EMPLOYEE DROP COLUMN BRANCH_ID');
    await queryRunner.query('DROP TABLE TB_BRANCH');
    await queryRunner.query('DROP TABLE TB_MUNICIPALITY');
    await queryRunner.query('DROP TABLE TB_DEPARTMENT');
  }
}
