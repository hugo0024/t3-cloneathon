{
  description = "T3 Stack Development Environment";
  
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  
  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.x86_64-linux.default = with pkgs; mkShell {
        buildInputs = [
          nodejs_20
          yarn
          # Add other dependencies as needed
        ];
        
        shellHook = ''
          echo "Node.js version: $(node --version)"
          echo "Yarn version: $(yarn --version)"
        '';
      };
    };
}
