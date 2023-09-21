const manager_dashboard = Vue.component("manager_dashboard", {
  template: `
    <div>
      <h2>Contact Us</h2>
      Below are our contact details!!
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid sed placeat vero, sit corporis fugiat rerum mollitia reiciendis dicta pariatur id architecto harum esse totam odio deserunt illum modi doloribus nobis velit magni repellendus at consequatur quasi. Illum quia rem atque eos itaque eius! Deleniti animi fuga inventore ut modi.

      <div class="container">
        <h2>User Dashboard</h2>
        <div v-for="category in categories" :key="category.id" class="card mb-3">
          <div class="card-header bg-primary text-white">
            <h5>{{ category.name }}</h5>
          </div>
          <div class="card-body">
            <div v-for="product in category.products" :key="product.id" class="row">
              <div class="col-md-4 mb-3">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">{{ product.name }}</h5>
                    <p class="card-text">Rate: ₹{{ product.rate }} / {{ product.unit.split('/')[1] }}</p>
                    <p class="card-text">Quantity: {{ product.quantity }} {{ product.unit.split('/')[1] }}</p>
                    <div class="card-footer">
                      <button @click="addToCart(category.id, product.id)" class="btn btn-primary">Add to cart</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      categories: [],
      products: [],
    };
  },

  methods: {
    addToCart(categoryId, productId) {
      // Implement the logic to add the selected product to the cart
    },

    fetchCategoriesAndProducts() {
      fetch('/api/categories')
        .then((response) => response.json())
        .then((categories) => {
          this.categories = categories;

          // Now that you have categories, fetch the associated products
          return fetch('/api/products');
        })
        .then((response) => response.json())
        .then((products) => {
          this.products = products;

          // Organize the products under their parent categories
          this.categories.forEach((category) => {
            category.products = this.products.filter((product) => product.parent === category.id);
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    },
  },

  mounted() {
    this.fetchCategoriesAndProducts();
    document.title = "manager_dashboard";
  },
});

export default manager_dashboard;
