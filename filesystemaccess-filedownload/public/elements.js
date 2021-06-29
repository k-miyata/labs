/**
 * Replaces the each placeholder of a custom element with an element cloned from
 * the template of that custom element and copies the attributes and the content
 * that the placeholder has. The each template element in a custom element must
 * have a `shadowroot` attribute.
 *
 * @param {Document | ShadowRoot | Element} root A root element that is the
 *   ancestor of the custom elements you want to load.
 * @param {Array.<string>} names The names of the custom elements you want to
 *   load.
 *
 * @example
 * loadCustomElementContents(this.shadowRoot, ["x-progress"]);
 */
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
