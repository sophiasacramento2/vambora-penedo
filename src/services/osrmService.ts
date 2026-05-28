export async function getRouteOSRM(coordinates: [number, number][]) {
  
  const coordsString = coordinates.map(c => `${c[1]},${c[0]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      console.error('Erro OSRM:', data.code);
      return coordinates; 
    }

    
    return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
  } catch (error) {
    console.error('Falha na requisição OSRM:', error);
    return coordinates;
  }
}