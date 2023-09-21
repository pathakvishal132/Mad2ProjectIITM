const edit_cat = Vue.component("edit_cat", {
  template: `
                <div>
                        <h2> edit_cat </h2>
                </div>
    `,

  mounted: function () {
    document.title = "EditCat";
  },
});

export default edit_cat;