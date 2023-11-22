/** @module Models/IPHistory */
import TypeORM from "typeorm";
import { User } from "./user";

@TypeORM.Entity()
export class IPHistory extends TypeORM.BaseEntity {
  @TypeORM.PrimaryGeneratedColumn()
  id: string;

  @TypeORM.Column("text")
  ip: string;

  @TypeORM.ManyToOne((type) => User, (user: User) => user.ips, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  @TypeORM.JoinColumn()
  user: TypeORM.Relation<User>;

  @TypeORM.CreateDateColumn()
  created_at: string;
}
