/** @module Models/User */
import TypeORM from "typeorm";
import { Recipes } from "./recipes";
import { User } from "./user";

@TypeORM.Entity()
export class MealPlans extends TypeORM.BaseEntity {
  @TypeORM.PrimaryGeneratedColumn()
  id: number;

  @TypeORM.Column()
  mealType: string;

  @TypeORM.Column()
  dayOfWeek: string;

  @TypeORM.ManyToOne(() => User, (user: User) => user.mps, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  user: TypeORM.Relation<User>;

  @TypeORM.ManyToOne(() => Recipes, (recipe: Recipes) => recipe.ids, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  recipe: TypeORM.Relation<Recipes>;

  @TypeORM.CreateDateColumn()
  created_at: string;

  @TypeORM.UpdateDateColumn()
  updated_at: string;
}
