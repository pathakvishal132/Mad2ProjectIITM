const Home = Vue.component("home", {
  template: `
   <div>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
          <a class="navbar-brand" href="/">Grocery Store</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <router-link to="/" class="nav-link">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/user_register" class="nav-link">User Register</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/manager_register" class="nav-link">Manager Register</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

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
    return {};
  },
  methods: {
    
  },
  mounted: function () {
    document.title = "Home - Green Market";
  },
  
});

export default Home;
