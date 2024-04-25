let producto=[];
let cart = [];
  document.addEventListener('DOMContentLoaded', function() {
    document.body.innerHTML += `
          <div class="overlay" onclick="escondercarrito()"></div>
          <div class="carrito">
              <div class="carrito-header">
                <button class="cerrar" onclick="escondercarrito()" >&#62</button>
                  <h3 class="carrito-header-titulo">Mi carrito</h3>
              </div>
              <div class="carrito-data"></div>
              <div class="carrito-footer">
              <button class="carrito-vaciar" onclick="vaciarcarrito()">Vaciar carrito</button>
                  <div class="carrito-precios">
                    <div class="carrito-subte">
                      <p>Subtotal:</p>
                      <p class="carrito-subtotal"></p>
                    </div>
                    <div class="carrito-descuen">
                      <p>Descuentos:</p>
                      <p class="carrito-descuentos"> </p>
                    </div>
                    <div class="carrito-tot">
                      <p >TOTAL:</p>
                      <p class="carrito-final"> </spapn>
                    </div>
                  </div>
                  <button class="comprar" onclick="comprar()">Finalizar Compra</button>
              </div>
          </div>`;
      cargarproductos();
      cargarcartlocal();
  });
  const cargarproductos = () => {
    Promise.all([
      fetch("http://localhost:3000/productos"),
      fetch("http://localhost:3000/ofertas"),
    ])
    .then(([resProductos, resOfertas]) => {
      return Promise.all([resProductos.json(), resOfertas.json()]);
    })
    .then(([productos, ofertas]) => {
      let traducciones = [];
  
      productos.forEach((element) => {
        traducciones.push(
          fetch("http://localhost:3000/traducir", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ texto: element.title }),
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error al traducir el titulo: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            element.title = data.traduccion;
          })
        );
        traducciones.push(
          fetch("http://localhost:3000/traducir", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ texto: element.description }),
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error al traducir la descripcion: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            element.description = data.traduccion;
          })
        );
      });
  
      return Promise.all(traducciones)
        .then(() => [productos, ofertas]);
    })
    .then(([productos, ofertas]) => {
      productos.forEach((element) => {
        const oferta = ofertas.find((oferta) => oferta.id === element.id);
        const val1 = cart.find((val) => val.id === element.id);
        const val2 = val1 ? "style='pointer-events: none;'" : "";
        const texto = val1 ? "En el carrito" : "Agregar al carrito";
        producto.push({
          id: element.id,
          title: element.title,
          price: element.price,
          description: element.description,
          category: element.category,
          image: element.image,
        })
        if (oferta) {
          let descuenta = element.price * (oferta.descuento/100);
          let preciooff = element.price - descuenta;
          let card = `
              <div class="card" >
                  <div class="imagen">
                      <img src="${element.image}">
                      <p class="categoria">${element.category}</p>
                      <p class="off">
                        <span style="display: block;">${oferta.descuento}% OFF!</span>
                      </p>
                  </div>
                  <div class="data">
                      <h3 class="titulo">${element.title}</h3>
                      <p class="precio">
                        <span style="font-size: 20px; display: inline;">$${preciooff.toFixed(2)} </span>
                        <span style="font-size: 12px; display: inline;color: gray;font-weight: normal;"><del>$${element.price.toFixed(2)}</del></span>
                        <span style="font-size: 12px; display: inline;color: gray;font-weight: normal;">- $${descuenta.toFixed(2)} </span>
                      </p>
                      <p class="corta">${element.description.substring(0, 30) + "..."}</p>
                      <p class="larga">${element.description}</p>
                      <button ${val2} class="addcarrito" onclick="agregaralcarrito('${element.id}', '${oferta.descuento}')" data-id="${element.id}">${texto}</button>
                  </div>
              </div>
          `;
          document.getElementById("container").innerHTML += card;
        } else {
          let card = `
              <div class="card" >
                  <div class="imagen">
                      <img src="${element.image}">
                      <p class="categoria">${element.category}</p>
                  </div>
                  <div class="data">
                      <h3 class="titulo">${element.title}</h3>
                      <p class="precio">$${element.price}</p>
                      <p class="corta">${element.description.substring(0, 30) + "..."}</p>
                      <p class="larga">${element.description}</p>
                      <button ${val2} class="addcarrito" onclick="agregaralcarrito('${element.id}', '0')" data-id="${element.id}">${texto}</button>
                  </div>
              </div>
          `;
          document.getElementById("container").innerHTML += card;
        }
      });
    })
    .catch((error) => console.error("Error:", error));
  };
  const actualizarcard = () => {
      for (const element of producto) {
        const val = cart.find((val) => val.id === element.id);
        const boton = document.querySelector(`.addcarrito[data-id="${element.id}"]`);
        if (val) {
          boton.innerHTML = 'En el carrito';
          boton.setAttribute("style", "pointer-events: none;" );
        }else{
          boton.innerHTML = 'Agregar al carrito';
          boton.setAttribute("style", "");
        }
      }
  };
  const agregaralcarrito = (id, descuento) => {
    let i = cart.findIndex((index) => index.id === producto[id-1].id);
    if(cart.length <= 0){
        cart = [{
            id: producto[id-1].id,
            title: producto[id-1].title,
            price: (producto[id-1].price).toFixed(2),
            descuento: descuento,
            final: ((producto[id-1].price)-(producto[id-1].price)*(descuento/100)).toFixed(2),
            description: producto[id-1].description,
            category: producto[id-1].category,
            image: producto[id-1].image,
            quantity: 1
        }];
    }else if(i < 0){
        cart.push({
            id: producto[id-1].id,
            title: producto[id-1].title,
            price: (producto[id-1].price).toFixed(2),
            descuento: descuento,
            final: ((producto[id-1].price)-(producto[id-1].price)*(descuento/100)).toFixed(2),
            description: producto[id-1].description,
            category: producto[id-1].category,
            image: producto[id-1].image,
            quantity: 1
        });
    }else{
        cart[i].quantity++;
    }
    guardarcarrito();
  };
  const guardarcarrito = () => {
    localStorage.setItem('carritofakestoreapi', JSON.stringify(cart));
    actualizarcard();
    cargarcarrito();
  };
  const cargarcartlocal = () => {
    cart = JSON.parse(localStorage.getItem("carritofakestoreapi")) || [];
  };
  const vaciarcarrito = () => {
    cart = [];
    localStorage.clear();
    actualizarcard();
    escondercarrito();
  };
  const mostrarcarrito = () => {
    cargarcarrito();
    document.querySelector(".carrito").style.transform = "none";
    document.querySelector(".overlay").style.visibility= "visible";
    document.body.style.overflow = 'hidden';
  };
  const escondercarrito = () => {
    document.querySelector(".carrito").style.transform= "translateX(100%)";
    document.querySelector(".overlay").style.visibility= "hidden";
    document.body.style.overflow = '';
  };
  const cargarcarrito = () => {
    if (cart.length === 0) {
      document.querySelector(".carrito-data").innerHTML ='Tu carrito se encuentra vacio';
      document.querySelector(".carrito-footer").style.display='none'
      return;
    }else{
      document.querySelector(".carrito-data").innerHTML ='';
      document.querySelector(".carrito-footer").style.display=''
    }
    let subtotalcarrito=0;
    let descuentocarrito=0;
    let totalcarrito=0;

    document.querySelector(".carrito-data").innerHTML = '';
    cart.forEach((element) => {
      subtotalcarrito+=element.price*element.quantity;
      descuentocarrito+=((element.price * (element.descuento/100))*element.quantity);
      totalcarrito+=element.final*element.quantity;
      const total= element.quantity*element.price;
      const texto1 = (element.descuento != 0) ? `${element.descuento}% OFF!` : "";
      const texto2 = (element.descuento != 0) ? `$ <del>${(element.price*element.quantity).toFixed(2)}</del>` : "";
      const style = (element.descuento != 0) ? `style="font-size: 0.9rem;color: gray;font-weight: normal;"` : "";
      const style2 = (element.descuento != 0) ? `style="top: 20px;"` : `style="top: 30px;"`;
      const style3 = (element.descuento != 0) ? `""` : `style="position: relative;top: 9px;"`;
      
      let item = `
            <div class="carrito-item">
            <div class="carrito-imagen">
              <img src="${producto[element.id-1].image}"/>
              </div>
              <div class="carrito-item-detail">
                <h3 class="carrito-titulo">${element.title.substring(0, 35) + "..."}</h3>
                <p class="off">
                  <span style="display: block;">${texto1}</span>
                </p>
                <div class="carrito-cantidades" ${style2}>
                    <button class="quitar" onclick="quitar(${element.id})">-</button>
                    <p class="carrito-cantidad">${element.quantity}</p>
                    <button class="agregar" onclick="agregar(${element.id})">+</button>
                  </div>
                <p class="carrito-total" ${style3}>
                  <span ${style} >${texto2}</span>
                  <span >$ ${(element.quantity*element.final).toFixed(2)}</span>
                </p>

              </div>
            </div>`;
    document.querySelector(".carrito-data").innerHTML+=item;
  })
  document.querySelector(".carrito-subtotal").textContent = '$'+ subtotalcarrito.toFixed(2);
  document.querySelector(".carrito-descuentos").textContent ='-$'+ descuentocarrito.toFixed(2) ;
  document.querySelector(".carrito-final").textContent = '$'+ totalcarrito.toFixed(2);
  }
  const agregar = (id) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    item.quantity++;
    guardarcarrito();
  };
  const quitar = (id) => {
    const i = cart.findIndex((x) => x.id === id);
    if (i === -1) return;
    const item = cart[i];
    item.quantity--;
    if (item.quantity <= 0) {
      cart.splice(i, 1);
    }
    guardarcarrito();
  };
  const comprar = () => {
    let total = 0;
    cart.forEach((element) => {
        total += element.final * element.quantity;
    });
    total=total.toFixed(2);
    const carritofinal={cart,total};
    fetch('http://localhost:3000/compras', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(carritofinal)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al procesar la compra: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    vaciarcarrito();
    alert("¡Gracias por tu compra!");
}
