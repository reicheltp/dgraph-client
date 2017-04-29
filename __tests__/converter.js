import {setPropertyValue, toSetMutation} from '../src/converter';
import {typesp, graphp} from '../src/protos';

describe('setPropertyValue', () => {
  it('can set a string', () => {
    let nquad = new graphp.NQuad();
    setPropertyValue(nquad, "string test");

    expect(nquad).toMatchSnapshot();
  });

  it('can set a double', () => {
    let nquad = new graphp.NQuad();
    setPropertyValue(nquad, 1.253);

    expect(nquad).toMatchSnapshot();
  });

  it('can set a bool', () => {
    let nquad = new graphp.NQuad();
    setPropertyValue(nquad, true);

    expect(nquad).toMatchSnapshot();
  });

  it('can set a geopoint', () => {
    let nquad = new graphp.NQuad();
    setPropertyValue(nquad, {type: 'Point', coordinates: [13.725, 52.145]});

    expect(nquad).toMatchSnapshot();
  });
});

describe('toSetMutation', () => {
  it('create nquads from object', () => {
    let obj = {name: 'Paul', size: 1.85};
    let mutations = toSetMutation(obj);

    expect(mutations).toMatchSnapshot();
  });

  it('uses _uid_ as subject', () => {
    let obj = {_uid_: '0xd8450668580bf30f', name2:'Paul 2'};
    let mutations = toSetMutation(obj);

    expect(mutations).toMatchSnapshot();
  });

  it('create nquads for nested objects', () => {
    let obj = {name:'Paul', friend: {name: 'Max'}};
    let mutations = toSetMutation(obj);

    expect(mutations).toMatchSnapshot();
  });
});