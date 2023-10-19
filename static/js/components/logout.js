const logout = Vue.component("logout", {
  template: `
    <div>
    <h2>Logging Out...</h2>
  </div>
  `,

  methods: {
    logoutUser() {
      // Make a request to the Flask /logout route to log the user out
      fetch('/logout', {
        method: 'GET', // You can use POST or GET depending on your Flask implementation
        // Add any necessary headers here
      })
      .then(response => {
        if (response.ok) {
          // Redirect to the login page upon successful logout
          this.$router.push('/');
        } else {
          // Handle any errors that occur during logout
          console.error('Logout failed:', response.statusText);
          // You can display an error message to the user if needed
        }
      })
      .catch(error => {
        console.error('Logout failed:', error);
        // Handle any network errors that may occur during logout
        // You can display an error message to the user if needed
      });
    },
  },

  mounted() {
    document.title = 'Logout';
    // Call the logoutUser method when the component is mounted
    this.logoutUser();
  },
});

export default logout;
