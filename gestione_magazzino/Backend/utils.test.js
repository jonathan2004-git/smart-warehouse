function classificaStato(distanza) {
    if (distanza < 15) return 'pieno';
    if (distanza <= 40) return 'parziale';
    return 'vuoto';
}

// ===== I TEST =====

test('distanza 10cm → pieno', () => {
    expect(classificaStato(10)).toBe('pieno');
});

test('distanza 14cm → pieno (appena sotto il limite)', () => {
    expect(classificaStato(14)).toBe('pieno');
});

test('distanza 15cm → parziale (soglia esatta)', () => {
    expect(classificaStato(15)).toBe('parziale');
});

test('distanza 40cm → parziale (limite massimo)', () => {
    expect(classificaStato(40)).toBe('parziale');
});

test('distanza 41cm → vuoto', () => {
    expect(classificaStato(41)).toBe('vuoto');
});

test('distanza 58cm → vuoto (quasi al limite massimo dello scaffale)', () => {
    expect(classificaStato(58)).toBe('vuoto');
});
