// ======================================================
// ZERO - CAMERA.JS
// Control de cámara, desplazamiento y zoom
// ======================================================

let canvas = null;
let ctx = null;

const camera = {
  x: 0,
  y: 0,
  zoom: 1
};

const settings = {
  minZoom: 0.55,
  maxZoom: 2.5,
  zoomStep: 0.1
};


// ======================================================
// INICIALIZAR
// ======================================================

export function initCamera(
  canvasElement,
  context
) {

  canvas = canvasElement;
  ctx = context;

  if (!canvas) {
    console.error(
      "❌ Camera: canvas no encontrado."
    );

    return;
  }

  console.log(
    "🎥 Cámara inicializada."
  );

}


// ======================================================
// OBTENER CÁMARA
// ======================================================

export function getCamera() {

  return camera;

}


// ======================================================
// CENTRAR EN UNA POSICIÓN DEL MAPA
// ======================================================

export function centerOn(
  x,
  y,
  tileSize
) {

  if (!canvas) {
    return;
  }

  const worldX =
    Number(x) *
    tileSize +
    tileSize / 2;

  const worldY =
    Number(y) *
    tileSize +
    tileSize / 2;


  camera.x =
    worldX -
    canvas.width /
      2 /
      camera.zoom;


  camera.y =
    worldY -
    canvas.height /
      2 /
      camera.zoom;

}


// ======================================================
// MOVER CÁMARA
// ======================================================

export function move(
  deltaX,
  deltaY
) {

  camera.x +=
    Number(deltaX) || 0;

  camera.y +=
    Number(deltaY) || 0;

}


// ======================================================
// ESTABLECER ZOOM
// ======================================================

export function setZoom(
  zoom
) {

  const newZoom =
    Number(zoom);

  if (
    !Number.isFinite(
      newZoom
    )
  ) {
    return;
  }

  camera.zoom =
    Math.max(
      settings.minZoom,
      Math.min(
        settings.maxZoom,
        newZoom
      )
    );

}


// ======================================================
// CAMBIAR ZOOM DESDE EL CENTRO
// ======================================================

export function zoom(
  direction
) {

  if (
    direction > 0
  ) {

    setZoom(
      camera.zoom +
      settings.zoomStep
    );

  } else if (
    direction < 0
  ) {

    setZoom(
      camera.zoom -
      settings.zoomStep
    );

  }

}


// ======================================================
// ZOOM HACIA EL CURSOR
// ======================================================

export function zoomAt(
  screenX,
  screenY,
  direction
) {

  if (!canvas) {
    return;
  }


  const oldZoom =
    camera.zoom;


  const newZoom =
    Math.max(
      settings.minZoom,
      Math.min(
        settings.maxZoom,
        oldZoom +
          direction *
          settings.zoomStep
      )
    );


  if (
    oldZoom ===
    newZoom
  ) {
    return;
  }


  // Posición del mundo
  // debajo del cursor

  const worldX =
    camera.x +
    screenX /
      oldZoom;

  const worldY =
    camera.y +
    screenY /
      oldZoom;


  camera.zoom =
    newZoom;


  // Mantener el mismo
  // punto debajo del cursor

  camera.x =
    worldX -
    screenX /
      newZoom;

  camera.y =
    worldY -
    screenY /
      newZoom;

}


// ======================================================
// CONVERTIR PANTALLA → MUNDO
// ======================================================

export function screenToWorld(
  screenX,
  screenY
) {

  return {

    x:
      camera.x +
      screenX /
        camera.zoom,

    y:
      camera.y +
      screenY /
        camera.zoom

  };

}


// ======================================================
// CONVERTIR MUNDO → PANTALLA
// ======================================================

export function worldToScreen(
  worldX,
  worldY
) {

  return {

    x:
      (
        worldX -
        camera.x
      ) *
      camera.zoom,

    y:
      (
        worldY -
        camera.y
      ) *
      camera.zoom

  };

}


// ======================================================
// APLICAR CÁMARA AL CANVAS
// ======================================================

export function beginRender() {

  if (!ctx) {
    return;
  }

  ctx.save();

  ctx.scale(
    camera.zoom,
    camera.zoom
  );

  ctx.translate(
    -camera.x,
    -camera.y
  );

}


// ======================================================
// RESTAURAR CANVAS
// ======================================================

export function endRender() {

  if (!ctx) {
    return;
  }

  ctx.restore();

}


// ======================================================
// POSICIÓN DE LA CÁMARA
// ======================================================

export function getPosition() {

  return {

    x: camera.x,

    y: camera.y,

    zoom: camera.zoom

  };

}


// ======================================================
// CONFIGURACIÓN
// ======================================================

export function getZoomLimits() {

  return {

    min:
      settings.minZoom,

    max:
      settings.maxZoom,

    step:
      settings.zoomStep

  };

}


// ======================================================
// EXPORTACIÓN
// ======================================================

export default {

  initCamera,

  getCamera,

  centerOn,

  move,

  setZoom,

  zoom,

  zoomAt,

  screenToWorld,

  worldToScreen,

  beginRender,

  endRender,

  getPosition,

  getZoomLimits

};
