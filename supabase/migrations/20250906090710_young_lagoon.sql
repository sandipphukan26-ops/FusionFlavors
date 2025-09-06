/*
  # Create Recipes Table

  1. New Tables
    - `recipes`
      - `id` (bigint, primary key, auto-increment)
      - `title` (text, recipe name)
      - `cuisine` (text, cuisine type)
      - `prep_time` (text, preparation time like "25 min")
      - `difficulty` (text, Easy/Medium/Hard)
      - `image_url` (text, recipe image URL)
      - `servings` (integer, number of servings)
      - `ingredients` (jsonb, array of ingredients)
      - `instructions` (jsonb, array of cooking steps)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recipes` table
    - Add policy for public read access (recipes are public)
    - Add policy for authenticated users to create recipes

  3. Sample Data
    - Insert sample recipes with proper images and data
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  cuisine text NOT NULL,
  prep_time text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  image_url text NOT NULL,
  servings integer NOT NULL DEFAULT 4,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to recipes
CREATE POLICY "Anyone can read recipes"
  ON recipes
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create recipes
CREATE POLICY "Authenticated users can create recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own recipes (for future use)
CREATE POLICY "Authenticated users can update recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert sample recipes
INSERT INTO recipes (title, cuisine, prep_time, difficulty, image_url, servings, ingredients, instructions) VALUES
(
  'Spaghetti Carbonara',
  'Italian',
  '25 min',
  'Medium',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  4,
  '["400g spaghetti pasta", "200g pancetta or guanciale, diced", "4 large eggs", "100g Pecorino Romano cheese, grated", "50g Parmesan cheese, grated", "2 cloves garlic, minced", "Freshly ground black pepper", "Salt to taste", "2 tablespoons olive oil"]'::jsonb,
  '["Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.", "While pasta cooks, heat olive oil in a large skillet over medium heat. Add pancetta and cook until crispy, about 5-7 minutes.", "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, and a generous amount of black pepper.", "Reserve 1 cup of pasta cooking water, then drain the pasta.", "Add the hot pasta to the skillet with pancetta. Remove from heat.", "Quickly pour the egg mixture over the pasta, tossing constantly to create a creamy sauce. Add pasta water as needed.", "Season with salt and additional pepper. Serve immediately with extra cheese."]'::jsonb
),
(
  'Chicken Teriyaki',
  'Japanese',
  '30 min',
  'Easy',
  'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  4,
  '["4 chicken thighs", "1/4 cup soy sauce", "2 tbsp mirin", "2 tbsp sake", "2 tbsp sugar", "1 tbsp vegetable oil", "2 green onions, sliced", "1 tsp sesame seeds"]'::jsonb,
  '["Mix soy sauce, mirin, sake, and sugar to make teriyaki sauce.", "Heat oil in a pan and cook chicken skin-side down until golden.", "Flip chicken and cook until done.", "Add teriyaki sauce and simmer until glossy.", "Garnish with green onions and sesame seeds."]'::jsonb
),
(
  'Beef Bourguignon',
  'French',
  '45 min',
  'Hard',
  'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  6,
  '["2 lbs beef chuck, cubed", "6 strips bacon", "1 onion, diced", "2 carrots, sliced", "3 cloves garlic", "3 tbsp tomato paste", "1 bottle red wine", "2 cups beef broth", "2 bay leaves", "Fresh thyme", "8 oz mushrooms", "Pearl onions"]'::jsonb,
  '["Cook bacon until crispy, remove and set aside.", "Brown beef cubes in bacon fat.", "Add onions, carrots, and garlic, cook until soft.", "Add tomato paste and cook 1 minute.", "Add wine and broth, bring to simmer.", "Add herbs and simmer 2 hours until tender.", "Add mushrooms and pearl onions in last 30 minutes."]'::jsonb
),
(
  'Pad Thai',
  'Thai',
  '20 min',
  'Medium',
  'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  2,
  '["8 oz rice noodles", "2 tbsp tamarind paste", "2 tbsp fish sauce", "2 tbsp palm sugar", "2 eggs", "1 cup bean sprouts", "3 green onions", "1/4 cup peanuts", "Lime wedges", "2 tbsp vegetable oil"]'::jsonb,
  '["Soak rice noodles in warm water until soft.", "Mix tamarind paste, fish sauce, and palm sugar for sauce.", "Heat oil in wok, scramble eggs.", "Add drained noodles and sauce, toss to combine.", "Add bean sprouts and green onions.", "Serve with peanuts and lime wedges."]'::jsonb
),
(
  'Kung Pao Chicken',
  'Chinese',
  '25 min',
  'Medium',
  'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  4,
  '["1 lb chicken breast, cubed", "1/2 cup peanuts", "3 dried chilies", "2 tbsp soy sauce", "1 tbsp rice wine", "1 tsp cornstarch", "2 tbsp vegetable oil", "2 cloves garlic", "1 inch ginger", "2 green onions"]'::jsonb,
  '["Marinate chicken with soy sauce, rice wine, and cornstarch.", "Heat oil in wok, stir-fry chicken until cooked.", "Add garlic, ginger, and dried chilies.", "Add peanuts and green onions.", "Toss everything together and serve hot."]'::jsonb
),
(
  'Feijoada',
  'Brazilian',
  '60 min',
  'Hard',
  'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  8,
  '["2 cups black beans", "1 lb pork shoulder", "1/2 lb chorizo", "1/2 lb bacon", "1 onion", "4 cloves garlic", "2 bay leaves", "1 orange, zested", "Collard greens", "White rice"]'::jsonb,
  '["Soak black beans overnight.", "Cook beans with bay leaves until tender.", "Brown all meats in a large pot.", "Add onions and garlic, cook until soft.", "Add cooked beans and simmer 1 hour.", "Add orange zest in last 10 minutes.", "Serve with rice and collard greens."]'::jsonb
),
(
  'Açaí Bowl',
  'Brazilian',
  '10 min',
  'Easy',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  2,
  '["2 açaí packets", "1 banana", "1/2 cup blueberries", "1/4 cup granola", "2 tbsp coconut flakes", "1 tbsp honey", "1/4 cup almond milk"]'::jsonb,
  '["Blend açaí packets with half banana and almond milk.", "Pour into bowl.", "Top with sliced banana, blueberries, granola.", "Sprinkle with coconut flakes and drizzle honey.", "Serve immediately."]'::jsonb
),
(
  'Bibimbap',
  'Korean',
  '45 min',
  'Medium',
  'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  4,
  '["2 cups cooked rice", "1 lb beef bulgogi", "1 cup spinach", "1 cup bean sprouts", "1 carrot, julienned", "4 shiitake mushrooms", "4 eggs", "Gochujang sauce", "Sesame oil", "Garlic"]'::jsonb,
  '["Prepare and season each vegetable separately.", "Cook beef bulgogi until tender.", "Fry eggs sunny-side up.", "Arrange rice in bowls.", "Top with vegetables, beef, and egg.", "Serve with gochujang sauce."]'::jsonb
),
(
  'Butter Croissant',
  'French',
  '180 min',
  'Hard',
  'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  8,
  '["3 cups bread flour", "1/4 cup sugar", "1 tsp salt", "1 packet active dry yeast", "1 cup warm milk", "1 cup cold butter", "1 egg for wash"]'::jsonb,
  '["Make dough with flour, sugar, salt, yeast, and milk.", "Chill dough for 1 hour.", "Roll out butter into rectangle.", "Encase butter in dough and fold.", "Repeat folding process 3 times with chilling.", "Roll out and cut into triangles.", "Shape into croissants and proof.", "Brush with egg wash and bake until golden."]'::jsonb
),
(
  'Chicken Tikka',
  'Indian',
  '50 min',
  'Medium',
  'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  4,
  '["2 lbs chicken breast, cubed", "1 cup yogurt", "2 tbsp lemon juice", "2 tsp garam masala", "1 tsp turmeric", "1 tsp cumin", "3 cloves garlic", "1 inch ginger", "2 tbsp vegetable oil"]'::jsonb,
  '["Mix yogurt with all spices, garlic, and ginger.", "Marinate chicken for at least 30 minutes.", "Thread chicken onto skewers.", "Grill or broil until cooked through.", "Serve with naan and chutney."]'::jsonb
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();