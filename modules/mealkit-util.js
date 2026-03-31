var mealkits = [
    {
        title: "Sautéed Ground Pork over Jasmine Rice",
        includes: "Toasted Peanuts & Quick-Pickled Cucumber Salad",
        description: "Gingery pork, crunchy cucumbers, and toasty peanuts",
        category: "Classic Meals",
        price: 19.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/images/Sautéed_Ground_Pork_over_Jasmine_Rice.png",
        featuredMealKit: true
      },
      {
        title: "Roasted Chicken with Garlic Potatoes",
        includes: "Herb-Roasted Potatoes & Lemon Jus",
        description: "Juicy roasted chicken with crispy potatoes and garlic flavor",
        category: "Classic Meals",
        price: 21.99,
        cookingTime: 35,
        servings: 2,
        imageUrl: "/images/Roasted_Chicken_with_Garlic_Potatoes.png",
        featuredMealKit: false
      },
      {
        title: "Beef Meatballs in Tomato Sauce",
        includes: "Creamy Mashed Potatoes & Steamed Green Beans",
        description: "Savory beef meatballs simmered in a rich tomato sauce",
        category: "Classic Meals",
        price: 20.99,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/images/Beef_Meatballs_in_Tomato_Sauce.png",
        featuredMealKit: false
      },
      {
        title: "Pan-Seared Salmon with Dill Sauce",
        includes: "Roasted Baby Potatoes & Seasonal Vegetables",
        description: "Tender salmon fillet with a fresh dill cream sauce",
        category: "Classic Meals",
        price: 23.99,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/images/Pan-Seared_Salmon_with_Dill_Sauce.png",
        featuredMealKit: true
      },

      {
        title: "Chickpea & Spinach Coconut Curry",
        includes: "Basmati Rice & Toasted Coconut",
        description: "Warm spices with creamy coconut and tender chickpeas",
        category: "Vegan Meals",
        price: 18.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/images/Chickpea_&_Spinach_Coconut_Curry.png",
        featuredMealKit: true
      },
      {
        title: "Roasted Vegetable Quinoa Bowl",
        includes: "Lemon Tahini Sauce & Pickled Red Onions",
        description: "Colorful roasted veggies over fluffy quinoa",
        category: "Vegan Meals",
        price: 17.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/images/Roasted_Vegetable_Quinoa_Bow.png",
        featuredMealKit: false
      },
      {
        title: "Vegan Mushroom Stroganoff",
        includes: "Creamy Cashew Sauce & Fresh Parsley",
        description: "Rich and comforting mushroom stroganoff without dairy",
        category: "Vegan Meals",
        price: 18.49,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/images/Vegan_Mushroom_Stroganoff.png",
        featuredMealKit: false
      },
      {
        title: "Sweet Potato & Black Bean Tacos",
        includes: "Avocado Crema & Shredded Red Cabbage",
        description: "Smoky sweet potatoes with hearty black beans in soft tortillas",
        category: "Vegan Meals",
        price: 17.49,
        cookingTime: 20,
        servings: 2,
        imageUrl: "/images/Sweet_Potato_&_Black_Bean_Tacos.png",
        featuredMealKit: true
      }
      
];

module.exports.getAllMealKits = function () {
    return mealkits;
}

module.exports.getFeaturedMealKits = function (meals) {

    let featured = [];

    meals.forEach(meal => {
        if (meal.featuredMealKit) {
            featured.push(meal);
        }
    });

    return featured;
}

module.exports.getMealKitsByCategory = function (mealKits) {

    const grouped = [];

    mealKits.forEach(meal => {

      let category = grouped.find(group => group.category === meal.category);
      
      if (!category) {
        category = {
          category: meal.category, 
          meals: [] 
        };
        grouped.push(category);
      }
      category.meals.push(meal);
    });

    return grouped;
}
