
function SvGcode(){
  console.log("SvgTranslate");
/*
  this.let svgPath = path.join(DIST_DIR, 'data', 'ideograma.svg');
  let gcode = "";

  var driver = new GCanvas.GcodeDriver({
    write: function(cmd) {
      gcode += cmd + '\n';
    }
  });

  let gctx = new GCanvas(driver, 230, 100);
  gctx.toolDiameter = 0.5;

  function run(file) {
    let svg = '' + fs.readFileSync(file);//''
    let splitSvg = svg.split("<svg");

    svg = splitSvg.join('<svg transform="scale(-1,1) translate(-100%,0)" ');

    canvg(gctx.canvas, svg.toString());
  }

  run(svgPath);
  let parsedGcode = parseGcode(gcode);
    */

}

export default SvGcode;
