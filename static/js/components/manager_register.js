const manager_register = Vue.component("manager_register", {
  template: `
    <div>
      <h2 class="mb-4">Manager Registration</h2>
      <form @submit.prevent="registerManager" class="registration-form">
        <div class="mb-3">
          <label for="username" class="form-label">Username:</label>
          <input type="text" id="username" v-model="managerData.username" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input type="password" id="password" v-model="managerData.password" class="form-control" required />
        </div>
        
        <div class="mb-3">
        <button type="submit" class="btn btn-primary">Register</button>
        </div>
        <div>
          <a class="nav-link active" aria-current="page">
            <router-link to="/login"><button type="button" class="btn btn-primary">Login</button></router-link>
          </a>
        </div>
      </form>
    </div>
  `,

  data() {
    return {
      managerData: {
        username: "",
        password: "",
      },
    };
  },

  methods: {
    registerManager() {
      const apiUrl = "/api/manager"; // Adjust this URL as needed
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.managerData),
      };

      fetch(apiUrl, requestOptions)
        .then((response) => {
          if (response.ok) {
            // Handle success (e.g., show a success message or redirect)
            
            // Optionally, you can redirect the manager to another page on success
            this.$router.push("/login"); // Redirect to the login page
          } else {
            // Handle errors (e.g., display error message)
            alert("Manager registration failed");
            console.error("Error:", response.statusText);
          }
        })
        .catch((error) => {
          // Handle network errors
          alert("Network error. Please try again.");
          console.error("Error:", error);
        });
    },
  },

  mounted() {
    document.title = "Manager Registration";
  },
});

export default manager_register;
