const Home = Vue.component("home", {
  template: `
    
      </div>

      <div class="container mt-5">
        <div class="welcome-section p-4">
          <h2 class="mb-4">Welcome to Green Market</h2>
          <div class="card-text mb-4">
            <p>
              At Green Market, we offer the freshest and finest selection of fruits and vegetables. 
              Our mission is to provide you with the highest quality produce to keep you healthy and happy.
              Whether you are a customer looking to buy the best products or a manager managing your inventory, 
              we have got you covered. Browse through our categories and products to find the perfect items for you.
            </p>
          </div>
          <router-link to="/login" class="btn btn-primary">Explore</router-link>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      signed: false, // Set to true or false based on your logic
    };
  },

  mounted: function () {
    document.title = "Home - Green Market";
  },
});

export default Home;
