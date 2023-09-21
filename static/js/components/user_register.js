const user_register = Vue.component("user_register", {
  template: `
    <div>
      <h2>User Registration</h2>
      <form @submit.prevent="registerUser">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="name" v-model="userData.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="userData.password" class="form-control" required />
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
      userData: {
        name: "",
        password: "",
      },
    };
  },

  methods: {
    registerUser() {
      const apiUrl = "/api/user"; // Adjust this URL as needed
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.userData),
      };

      fetch(apiUrl, requestOptions)
        .then((response) => {
          if (response.ok) {
            // Handle success (e.g., show a success message or redirect)
            alert("User registration successful");
            // Optionally, you can redirect the user to another page on success
            this.$router.push("/login"); // Redirect to the login page
          } else {
            // Handle errors (e.g., display error message)
            alert("User registration failed");
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
    document.title = "User Registration";
  },
});

export default user_register;
