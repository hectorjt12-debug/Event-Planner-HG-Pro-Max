export function importarPlano() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      const el = document.getElementById("plano-fondo");
      if (el) {
        el.style.backgroundImage = `url(${url})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
      }
    }
  };

  input.click();
}