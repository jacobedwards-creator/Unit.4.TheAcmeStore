const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
  } = require('./db');
  
  const seed = async () => {
    console.log('Starting to seed database...');
    
    await client.connect();
    console.log('Connected to database');
  
    await createTables();
    console.log('Tables created');
  
    console.log('Creating users...');
    const [moe, lucy, ethyl] = await Promise.all([
      createUser({ username: 'moe', password: 'moe_password' }),
      createUser({ username: 'lucy', password: 'lucy_password' }),
      createUser({ username: 'ethyl', password: 'ethyl_password' })
    ]);
    console.log('Users created:', await fetchUsers());

    console.log('Creating products...');
    const [shirt, pants, socks, hat] = await Promise.all([
      createProduct({ name: 'T-Shirt' }),
      createProduct({ name: 'Jeans' }),
      createProduct({ name: 'Socks' }),
      createProduct({ name: 'Baseball Cap' })
    ]);
    console.log('Products created:', await fetchProducts());
  
    console.log('Creating favorites...');
    const [favorite1, favorite2, favorite3] = await Promise.all([
      createFavorite({ user_id: moe.id, product_id: shirt.id }),
      createFavorite({ user_id: moe.id, product_id: pants.id }),
      createFavorite({ user_id: lucy.id, product_id: socks.id })
    ]);
    console.log('Favorites created for Moe:', await fetchFavorites(moe.id));
    console.log('Favorites created for Lucy:', await fetchFavorites(lucy.id));
  
  };
  
  seed().catch(error => {
    console.error('Error seeding database:', error);
    client.end();
  });