/** @module Models/User */
import TypeORM from "typeorm";
import { MealPlans } from "./meal_plans";
import { RecipeIngredientRel } from "./recipe_ingredient_rel";

@TypeORM.Entity()
export class Recipes extends TypeORM.BaseEntity {
  @TypeORM.PrimaryGeneratedColumn()
  id: number;

  @TypeORM.Column()
  recipeName: string;

  @TypeORM.Column()
  dietType: string;

  @TypeORM.Column()
  cuisine: string;

  @TypeORM.Column({
  	length: 500,
  	type: "varchar",
  })
  description: string;

  @TypeORM.OneToMany((type) => MealPlans, (mp: MealPlans) => mp.recipe)
  ids: TypeORM.Relation<MealPlans[]>;

  @TypeORM.OneToMany(
  	() => RecipeIngredientRel,
  	(rpi: RecipeIngredientRel) => rpi.recipe
  )
  rpIngRel: TypeORM.Relation<RecipeIngredientRel[]>;

  @TypeORM.CreateDateColumn()
  created_at: string;

  @TypeORM.UpdateDateColumn()
  updated_at: string;
}
