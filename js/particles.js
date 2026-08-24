// Particle Network Background - Exciting Feature
const canvas = document.getElementById('particle-canvas');
if(canvas){
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = {x:null, y:null};

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });

  class Particle {
    constructor(){
      this.x = Math.random()*canvas.width;
      this.y = Math.random()*canvas.height;
      this.vx = (Math.random()-0.5)*0.8;
      this.vy = (Math.random()-0.5)*0.8;
      this.size = Math.random()*2+0.5;
      this.alpha = Math.random()*0.5+0.2;
    }
    update(){
      this.x+=this.vx; this.y+=this.vy;
      if(this.x<0||this.x>canvas.width) this.vx*=-1;
      if(this.y<0||this.y>canvas.height) this.vy*=-1;
      // mouse interaction
      if(mouse.x){
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx*dx+dy*dy);
        if(dist<150){
          this.x -= dx/50;
          this.y -= dy/50;
        }
      }
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
      ctx.fillStyle = `rgba(124,58,237,${this.alpha})`;
      ctx.fill();
    }
  }

  function init(){
    particles = [];
    let count = Math.floor((canvas.width*canvas.height)/12000);
    for(let i=0;i<count;i++) particles.push(new Particle());
  }
  init();

  function connect(){
    for(let a=0;a<particles.length;a++){
      for(let b=a+1;b<particles.length;b++){
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let dist = Math.sqrt(dx*dx+dy*dy);
        if(dist<130){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${0.15*(1-dist/130)})`;
          ctx.lineWidth=0.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{ p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', init);
}
