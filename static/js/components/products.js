const product = Vue.component("product ", {
  template: `
                <div>
                        <h2> product </h2>
                </div>
    `,

  mounted: function () {
    document.title = "product ";
  },
});

export default product ;