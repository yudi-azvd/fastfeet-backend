import factory from '../factories';

describe.only('factory', () => {
  it('should wokr', async () => {
    console.log((await factory.attrs('User')).name);
    console.log((await factory.attrs('User')).name);
    console.log((await factory.attrs('User')).name);
    console.log((await factory.attrs('User')).name);
    console.log((await factory.attrs('User')).name);
    console.log((await factory.attrs('User')).name);
    // console.log((await factory.attrs('User')).name);
    // console.log((await factory.attrs('User')).name);
    expect(1 + 1).toBe(2);
  });
});
