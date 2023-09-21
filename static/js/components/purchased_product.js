const purchased_products = Vue.component("purchased_products", {
  template: `
                <div>
                        <h2> purchased_products </h2>
                </div>
    `,

  mounted: function () {
    document.title = "PurchasedProducts";
  },
});

export default purchased_products ;