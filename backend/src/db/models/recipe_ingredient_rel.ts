/** @module Models/User */
import TypeORM from "typeorm";
import { Ingredients } from "./ingredients";
import { Recipes } from "./recipes";


@TypeORM.Entity()
export class RecipeIngredientRel extends TypeORM.BaseEntity {
  @TypeORM.PrimaryGeneratedColumn()
  id: number;

  @TypeORM.ManyToOne(() => Recipes, (recipe: Recipes) => recipe.rpIngRel, {
  	cascade: true,
  	onDelete: "CASCADE",
  })
  recipe: TypeORM.Relation<Recipes>;

  @TypeORM.ManyToOne(
  	() => Ingredients,
  	(ing: Ingredients) => ing.rpIngRel,
  	{
  		cascade: true,
  		onDelete: "CASCADE",
  	}
  )
  ingredient: TypeORM.Relation<Ingredients>;
}
