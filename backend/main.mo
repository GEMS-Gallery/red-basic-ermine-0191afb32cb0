import Char "mo:base/Char";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

actor {
  // Types
  type Position = { x : Nat; y : Nat };
  type ElementType = {
    #wall;
    #floor;
    #desk;
    #chair;
    #plant;
    #computer;
  };
  type Element = { id : Text; elementType : ElementType; position : Position };
  type OfficeState = { layout : [[ElementType]]; elements : [Element]; characterPosition : Position };

  // Stable variables
  stable var officeLayout : [[ElementType]] = [[]];

  // Mutable variables
  var characterPosition : Position = { x = 0; y = 0 };
  var interactiveElements = HashMap.HashMap<Text, Element>(10, Text.equal, Text.hash);

  // Initialize the office
  public func initializeOffice() : async Result.Result<(), Text> {
    officeLayout := [
      [#wall, #wall, #wall, #wall, #wall],
      [#wall, #floor, #floor, #floor, #wall],
      [#wall, #floor, #desk, #floor, #wall],
      [#wall, #floor, #chair, #floor, #wall],
      [#wall, #wall, #wall, #wall, #wall]
    ];
    characterPosition := { x = 1; y = 1 };
    interactiveElements.put("desk1", { id = "desk1"; elementType = #desk; position = { x = 2; y = 2 } });
    interactiveElements.put("chair1", { id = "chair1"; elementType = #chair; position = { x = 2; y = 3 } });
    interactiveElements.put("plant1", { id = "plant1"; elementType = #plant; position = { x = 3; y = 1 } });
    #ok(())
  };

  // Move character
  public func moveCharacter(x : Nat, y : Nat) : async Result.Result<(), Text> {
    if (x >= officeLayout[0].size() or y >= officeLayout.size()) {
      return #err("Invalid position");
    };
    switch (officeLayout[y][x]) {
      case (#wall) { return #err("Cannot move to a wall"); };
      case (#desk) { return #err("Cannot move to a desk"); };
      case _ { characterPosition := { x = x; y = y }; };
    };
    #ok(())
  };

  // Interact with element
  public func interactWithElement(elementId : Text) : async Result.Result<Text, Text> {
    switch (interactiveElements.get(elementId)) {
      case (null) { #err("Element not found") };
      case (?element) {
        if (element.position.x == characterPosition.x and element.position.y == characterPosition.y) {
          #ok("Interacting with " # debug_show(element.elementType))
        } else {
          #err("Too far from element")
        }
      };
    }
  };

  // Get office state
  public query func getOfficeState() : async OfficeState {
    {
      layout = officeLayout;
      elements = Array.map<(Text, Element), Element>(
        Iter.toArray(interactiveElements.entries()),
        func((_, element)) { element }
      );
      characterPosition = characterPosition;
    }
  };

  // System functions
  system func preupgrade() {
    // Implement if needed
  };

  system func postupgrade() {
    // Implement if needed
  };
}
