import { EntitySchema } from 'typeorm';

export const FixedAssetEntity = new EntitySchema({
  name: 'FixedAsset',
  tableName: 'TB_FIXED_ASSET',
  columns: {
    id: { name: 'ID', type: Number, primary: true, generated: 'increment' },
    branchId: { name: 'BRANCH_ID', type: Number },
    code: { name: 'CODE', type: String, length: 40 },
    name: { name: 'NAME', type: String, length: 120 },
    category: { name: 'CATEGORY', type: String, length: 80, nullable: true },
    location: { name: 'LOCATION', type: String, length: 120, nullable: true },
    responsible: { name: 'RESPONSIBLE', type: String, length: 120, nullable: true },
    purchaseDate: { name: 'PURCHASE_DATE', type: 'timestamp', nullable: true },
    purchaseCost: { name: 'PURCHASE_COST', type: 'decimal', precision: 14, scale: 2, default: 0 },
    accumulatedDepreciation: { name: 'ACCUMULATED_DEPRECIATION', type: 'decimal', precision: 14, scale: 2, default: 0 },
    usefulLifeMonths: { name: 'USEFUL_LIFE_MONTHS', type: Number, nullable: true },
    notes: { name: 'NOTES', type: String, length: 255, nullable: true },
    retiredAt: { name: 'RETIRED_AT', type: 'timestamp', nullable: true },
    retiredReason: { name: 'RETIRED_REASON', type: String, length: 255, nullable: true },
    status: { name: 'STATUS', type: String, length: 2, default: 'E' },
    createdAt: { name: 'CREATED_AT', type: 'timestamp', createDate: true },
    updatedAt: { name: 'UPDATED_AT', type: 'timestamp', updateDate: true, nullable: true },
    createdBy: { name: 'CREATED_BY', type: Number, nullable: true },
    updatedBy: { name: 'UPDATED_BY', type: Number, nullable: true }
  },
  relations: {
    branch: { type: 'many-to-one', target: 'Branch', joinColumn: { name: 'BRANCH_ID' } },
    history: { type: 'one-to-many', target: 'FixedAssetHistory', inverseSide: 'fixedAsset' }
  }
});
