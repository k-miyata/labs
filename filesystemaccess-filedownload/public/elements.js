export function loadCustomElementContents(root, names) {
  names.forEach((name) => {
    root.querySelectorAll(name).forEach((placeholder) => {
      const template = document.querySelector(`template#${name}`);
      const fragment = template.content.cloneNode(true);
      const element = fragment.querySelector(name);
      const attributes = placeholder.attributes;
      for (let index = 0; index < attributes.length; index++) {
        const { name, value } = attributes[index];
        element.setAttribute(name, value);
      }
      element.innerHTML = placeholder.innerHTML;
      placeholder.replaceWith(fragment);
    });
  });
}
