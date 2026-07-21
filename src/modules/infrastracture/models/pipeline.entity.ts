import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from '../../shared/entites/common.entity';

export enum PipelineType {
  MAIN_SOURCE = 'MAIN_SOURCE',
  MAIN_LINE = 'MAIN_LINE',
  BRANCH = 'BRANCH',
  LATERAL = 'LATERAL',
}

export enum PipelineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DAMAGED = 'DAMAGED',
}

export enum PipelineMaterial {
  PVC = 'PVC',
  STEEL = 'STEEL',
  HDPE = 'HDPE',
  CAST_IRON = 'CAST_IRON',
}

export class Coordinate {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface GeoJsonPoint {
  type: 'Point';
  coordinates:
    | [longitude: number, latitude: number]
    | [longitude: number, latitude: number, elevation: number];
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: Array<
    | [longitude: number, latitude: number]
    | [longitude: number, latitude: number, elevation: number]
  >;
}

@Entity()
export class Pipeline extends CommonEntity {
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
  })
  start: GeoJsonPoint;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
  })
  end: GeoJsonPoint;

  @Column({ type: String })
  name: string;

  @Column({ type: String, nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: PipelineType })
  type: PipelineType;

  @Column({
    type: 'enum',
    enum: PipelineStatus,
    default: PipelineStatus.ACTIVE,
  })
  status: PipelineStatus;

  @Column({ type: 'enum', enum: PipelineMaterial, nullable: true })
  material?: PipelineMaterial;

  @Column({ type: 'float', nullable: true })
  diameterMm?: number;

  @Column({ type: 'float', nullable: true })
  pressureBarMax?: number;

  @ManyToOne(() => Pipeline, (p) => p.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Pipeline;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @OneToMany(() => Pipeline, (p) => p.parent)
  children: Pipeline[];

  @Column({ type: 'jsonb' })
  coordinates: Coordinate[];

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: false,
  })
  path: GeoJsonLineString;

  @Column({ type: 'float', default: 0 })
  lengthKm: number;
}
