/** @module Models/User */
import TypeORM from "typeorm";
import { Ingredients } from "./ingredients";
import { User } from "./user";

@TypeORM.Entity()
export class ShoppingList extends TypeORM.BaseEntity {
  @TypeORM.PrimaryGeneratedColumn()
  id: number;

  @TypeORM.Column({ default: false })
  check: boolean;

  @TypeORM.ManyToOne(() => User, (user: User) => user.slIds, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  user: TypeORM.Relation<User>;

  @TypeORM.ManyToOne(() => Ingredients, (ing: Ingredients) => ing.slId, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  ing: TypeORM.Relation<Ingredients>;
}
