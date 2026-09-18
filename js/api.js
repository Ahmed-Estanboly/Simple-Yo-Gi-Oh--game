async function getMonsterData() {
  try {
    let url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?type=Normal%20Monster`;
    console.log('[API] Requesting normal monster cards');
    let response = await fetch(url);
    console.log(`[API] Response received: ${response.status} ${response.statusText}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Invalid API response");
    console.log(`[API] Loaded ${payload.data.length} cards`);
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
    console.error('[API] Failed to load monster cards:', error);
    throw error;
  }
}
