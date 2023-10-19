const add_cart = Vue.component("add_cart", {
  props: ["category_id", "product_id"],
  template: `<div class="container" v-if="dataloaded">
  <h1> Add Your quantity </h1>
    <h1 class="mb-4">{{ productData.product_name }}</h1>
    <h4 class="mb-4">Quantity: {{ productData.product_quantity }} </h4>
    <form @submit.prevent="addToCart">
      <div class="mb-3">
        <label for="quantity" class="form-label">Quantity</label>
        <input type="number" class="form-control" v-model="quantity" min="0" :max="productData.product_quantity">
      </div>
      <div class="mb-3">
        <label for="price" class="form-label">Price</label>
        <input type="text" class="form-control" :value="productData.product_rate" readonly>
      </div>
      <div class="mb-3">
        <label for="total" class="form-label">Total</label>
        <input type="text" class="form-control" v-model="total" readonly>
      </div>
      <button type="submit" class="btn btn-primary">Add to Cart</button>
    </form>
  </div>
  `,
  data() {
    return {
      quantity: 0,
      total: 0,
      productData: {},
      categoryData: {},
      dataloaded: false,
    };
  },
  methods: {
    addToCart() {
      // Make a POST request to your Flask route to add to cart
      fetch(`/add_to_cart/${this.category_id}/${this.product_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: this.quantity }),
      })
        .then((response) => response.json())
        .then((data) => {
          
          // Handle the response, e.g., show a success message
          console.log(data.message);
           this.$router.push("/cart");
        })
        .catch((error) => {
          // Handle errors, e.g., show an error message
          console.error(error);
        });
    },
  },
  watch: {
    // Watch for changes in the 'quantity' data property
    quantity: function (newQuantity) {
      // Calculate the total based on the new quantity and price
      const price = parseFloat(this.productData.product_rate);
      this.total = isNaN(newQuantity) || isNaN(price) ? 0 : (newQuantity * price).toFixed(2);
    },
  },
  mounted() {
    // Fetch product and category data from your Flask route
    fetch(`/add_to_cart/${this.category_id}/${this.product_id}`)
      .then((response) => response.json())
      .then((data) => {
        // Set the fetched data to the component properties
        this.productData = data.product;
        this.categoryData = data.category;
        
        
        // Set dataloaded to true when data is fetched
        this.dataloaded = true;
      })
      .catch((error) => {
        // Handle errors, e.g., show an error message
        console.error(error);
      });
  },
});

export default add_cart;
