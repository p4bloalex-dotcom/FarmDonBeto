import 'dotenv/config';
import oracledb from 'oracledb';

async function seed() {
  const conn = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING
  });

  try {
    const existing = await conn.execute('SELECT ID FROM TB_COMPANY WHERE ROWNUM = 1', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (existing.rows.length > 0) {
      console.log('TB_COMPANY already has data (ID=' + existing.rows[0].ID + '). Skipping.');
      return;
    }

    const deptResult = await conn.execute("SELECT ID FROM TB_DEPARTMENT WHERE NAME = 'Guatemala'", [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const idDepartment = deptResult.rows[0]?.ID;
    if (!idDepartment) {
      console.error('Department Guatemala not found');
      return;
    }

    const muniResult = await conn.execute("SELECT ID FROM TB_MUNICIPALITY WHERE NAME = 'Guatemala' AND ID_DEPARTMENT = :deptId", [idDepartment], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const idMunicipality = muniResult.rows[0]?.ID;
    if (!idMunicipality) {
      console.error('Municipality Guatemala not found');
      return;
    }

    const result = await conn.execute(
      `INSERT INTO TB_COMPANY (NAME, PHONE, ID_DEPARTMENT, ID_MUNICIPALITY, ADDRESS, EMAIL, LOGO, STATUS)
       VALUES (:name, :phone, :idDepartment, :idMunicipality, :address, :email, :logo, :status)
       RETURNING ID INTO :id`,
      {
        name: 'Alkode S.A.',
        phone: '22345678',
        idDepartment,
        idMunicipality,
        address: 'Zona 10',
        email: 'info@alkode.com',
        logo: ' ',
        status: 'E',
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    await conn.commit();

    const newId = result.outBinds.id[0];
    console.log('TB_COMPANY insertada con ID=' + newId);
  } finally {
    await conn.close();
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
