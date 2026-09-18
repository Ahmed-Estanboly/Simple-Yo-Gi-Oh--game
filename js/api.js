async function getMonsterData() {
  try {
    let url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?type=Normal%20Monster`;
    let response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Invalid API response");
    return payload.data.map(card=>({
        id: card.id,
        name: card.name,
        desc: card.desc,
        atk: card.atk,
        def: card.def,
        imgs: card.card_images
    }));
  } 
  catch(error){
    console.log(error.message);
    throw error;
  }
}
