import { EntitySchema } from 'typeorm';

export const FixedAssetHistoryEntity = new EntitySchema({
  name: 'FixedAssetHistory',
  tableName: 'TB_FIXED_ASSET_HISTORY',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    fixedAssetId: { name: 'FIXED_ASSET_ID', type: Number },
    action: { name: 'ACTION', type: String, length: 20 },
    branchFromId: { name: 'BRANCH_FROM_ID', type: Number, nullable: true },
    branchToId: { name: 'BRANCH_TO_ID', type: Number, nullable: true },
    locationFrom: { name: 'LOCATION_FROM', type: String, length: 120, nullable: true },
    locationTo: { name: 'LOCATION_TO', type: String, length: 120, nullable: true },
    responsibleFrom: { name: 'RESPONSIBLE_FROM', type: String, length: 120, nullable: true },
    responsibleTo: { name: 'RESPONSIBLE_TO', type: String, length: 120, nullable: true },
    reason: { name: 'REASON', type: String, length: 255 },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true }
  },
  relations: {
    fixedAsset: { type: 'many-to-one', target: 'FixedAsset', joinColumn: { name: 'FIXED_ASSET_ID' } },
    branchFrom: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_FROM_ID' } },
    branchTo: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_TO_ID' } }
  }
});
