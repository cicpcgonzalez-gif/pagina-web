const fs = require('fs');
const path = 'c:\\Users\\gilbe\\Downloads\\Nueva carpeta (3)\\backednnuevo-main\\backednnuevo-main\\index.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Update POST /raffles to save minTickets and paymentMethods
    const oldCreate = `const { title, price, description, totalTickets, startDate, endDate, securityCode, lottery, instantWins, terms } = req.body;
    const raffle = await prisma.raffle.create({
      data: {
        title,
        prize: description,
        ticketPrice: Number(price),
        totalTickets: Number(totalTickets),
        lottery,
        terms,
        style: { instantWins } // Storing instantWins in style JSON for now
      }
    });`;

    const newCreate = `const { title, price, description, totalTickets, startDate, endDate, securityCode, lottery, instantWins, terms, minTickets, paymentMethods } = req.body;
    const raffle = await prisma.raffle.create({
      data: {
        title,
        prize: description,
        ticketPrice: Number(price),
        totalTickets: Number(totalTickets),
        lottery,
        terms,
        style: { instantWins, minTickets: Number(minTickets) || 1, paymentMethods }
      }
    });`;

    if (content.includes(oldCreate)) {
        content = content.replace(oldCreate, newCreate);
        console.log('Updated POST /raffles');
    } else {
        console.log('Could not find POST /raffles pattern');
        // Try a more robust replacement if exact match fails due to whitespace
        // Regex approach for the destructuring line
        content = content.replace(
            /const \{ title, price, description, totalTickets, startDate, endDate, securityCode, lottery, instantWins, terms \} = req\.body;/,
            'const { title, price, description, totalTickets, startDate, endDate, securityCode, lottery, instantWins, terms, minTickets, paymentMethods } = req.body;'
        );
        // Regex for the style object
        content = content.replace(
            /style: \{ instantWins \} \/\/ Storing instantWins in style JSON for now/,
            'style: { instantWins, minTickets: Number(minTickets) || 1, paymentMethods }'
        );
    }

    // 2. Update POST /raffles/:id/purchase to check minTickets
    // We look for the line where raffle is found and add the check
    const purchaseSearch = `const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });`;

    const purchaseReplace = `const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });

    const minTickets = raffle.style?.minTickets || 1;
    if (qty < minTickets) {
        return res.status(400).json({ error: \`La compra mínima es de \${minTickets} tickets\` });
    }`;

    if (content.includes(purchaseSearch) && !content.includes('const minTickets = raffle.style?.minTickets')) {
        // Note: purchaseSearch appears in multiple places?
        // The first one is likely the purchase endpoint.
        // Let's be more specific.
        // The purchase endpoint has `const qty = Number(quantity);` before it.
        
        const specificPurchaseSearch = `const qty =       
Number(quantity);

  try {
    const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
    if (!raffle)    
return res.status(404).json({ error: 'Rifa no encontrada' });`;
        
        // The grep output had weird formatting, let's rely on the code structure I know exists
        // I'll use a regex that matches the purchase endpoint structure
        
        const purchaseRegex = /(app\.post\('\/raffles\/:id\/purchase'.*?const qty = Number\(quantity\);.*?const raffle = await prisma\.raffle\.findUnique\(\{ where: \{ id: Number\(id\) \} \}\);\s*if \(!raffle\) return res\.status\(404\)\.json\(\{ error: 'Rifa no encontrada' \}\);)/s;
        
        content = content.replace(purchaseRegex, (match) => {
            return match + `
    const minTickets = raffle.style?.minTickets || 1;
    if (qty < minTickets) {
        return res.status(400).json({ error: \`La compra mínima es de \${minTickets} tickets\` });
    }`;
        });
        console.log('Updated POST /raffles/:id/purchase');
    }

    // 3. Update POST /raffles/:id/manual-payments
    const manualSearch = `const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
    if (!raffle) return res.status(404).json({ error: 'Rifa no encontrada' });`;
    
    // This string is identical to the one in purchase.
    // I need to target the manual-payments endpoint specifically.
    
    const manualRegex = /(app\.post\('\/raffles\/:id\/manual-payments'.*?const raffle = await prisma\.raffle\.findUnique\(\{ where: \{ id: Number\(id\) \} \}\);\s*if \(!raffle\) return res\.status\(404\)\.json\(\{ error: 'Rifa no encontrada' \}\);)/s;

    content = content.replace(manualRegex, (match) => {
         return match + `
    const minTickets = raffle.style?.minTickets || 1;
    if (quantity < minTickets) {
        return res.status(400).json({ error: \`La compra mínima es de \${minTickets} tickets\` });
    }`;
    });
    console.log('Updated POST /raffles/:id/manual-payments');

    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully updated index.js');

} catch (err) {
    console.error('Error updating file:', err);
}
