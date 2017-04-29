import protos from '../src/protos';

describe("protos", () => {
  it('match snapshot', () => {
    expect(protos).toMatchSnapshot();
  });
});