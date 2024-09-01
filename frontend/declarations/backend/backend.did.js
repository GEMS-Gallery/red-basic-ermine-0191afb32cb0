export const idlFactory = ({ IDL }) => {
  const Position = IDL.Record({ 'x' : IDL.Nat, 'y' : IDL.Nat });
  const Element = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'position' : Position,
  });
  const OfficeState = IDL.Record({
    'layout' : IDL.Vec(IDL.Vec(IDL.Nat)),
    'characterPosition' : Position,
    'elements' : IDL.Vec(Element),
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'getOfficeState' : IDL.Func([], [OfficeState], ['query']),
    'initializeOffice' : IDL.Func([], [Result], []),
    'interactWithElement' : IDL.Func([IDL.Text], [Result_1], []),
    'moveCharacter' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
