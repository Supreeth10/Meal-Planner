/** @module Models/User */
import TypeORM from "typeorm";
import { IPHistory } from "./ip_history";
import { MealPlans } from "./meal_plans";
import { ShoppingList } from "./shopping_list";

@TypeORM.Entity({ name: "users" })
export class User extends TypeORM.BaseEntity {
  @TypeORM.PrimaryColumn()
  id: string;

  @TypeORM.Column({
  	length: 100,
  	type: "varchar",
  })
  name: string;

  @TypeORM.Column("text")
  email: string;

  @TypeORM.OneToMany(() => IPHistory, (ip: IPHistory) => ip.user)
  ips: TypeORM.Relation<IPHistory[]>;

  @TypeORM.OneToMany(() => MealPlans, (mp: MealPlans) => mp.user)
  mps: TypeORM.Relation<MealPlans[]>;

  @TypeORM.OneToMany(() => ShoppingList, (sl: ShoppingList) => sl.user)
  slIds: TypeORM.Relation<ShoppingList[]>;

  @TypeORM.CreateDateColumn()
  created_at: string;

  @TypeORM.UpdateDateColumn()
  updated_at: string;
}
