require.config({
    baseUrl: './scripts',
    // ...
    packages: [
        {
            name: 'physicsjs',
            location: 'physicsjs',
            main: 'physicsjs-0.6.0.min'
        }
    ]
});

require([
    'physicsjs',
    'physicsjs/bodies/circle', // will mix into the PhysicsJS library
    'physicsjs/renderers/canvas',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/constant-acceleration',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-impulse-response',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/newtonian',
    'physicsjs/integrators/metre-per-second-squared-verlet'

], function( Physics ){
    Physics({
            getBallHeight: function getBallHeight(){
                return document.getElementById("ballHeight").value;
            },
            getFriction: function getFriction (){
                return document.getElementById("friction").value-0;
            }
        },
        function (world) {
        //inputs
        var friction = world.options.getFriction();
        var metre = 30;
        world.metre = metre;



        var viewWidth = document.getElementById('simBox').width
        ,viewHeight = document.getElementById('simBox').height
        // bounds of the window
        ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        ,renderer;
        var ballHeight =(world.options.getBallHeight()*metre);//@todo utilize

        world.getSimHeight = function (objHeight){
            return (viewHeight-objHeight)/metre;
        }
        // create a renderer
        renderer = Physics.renderer('canvas', {
            el: 'simBox'
            ,width: viewWidth
            ,height: viewHeight
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });

        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds
            ,restitution:0
            ,cof: 0.8
        });

        // metre per second squared verlet integrator
        mppsvi = Physics.integrator('metre-per-second-squared-verlet', {
            metre: metre
        });


        // create some bodies
        var b,
        r = metre,
        height = viewHeight -2*r,
        width = viewWidth -4*r,
        ramp;

        ramp = Physics.body('convex-polygon', {
            name: 'ramp',
            x: (width/3),
            y: (2*height/3)+2*r,
            treatment: 'static',
            restitution: 0,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: -height},
                {x: width, y: 0}
            ]
        })

        b = Physics.body('circle', {
            cof: friction,
            radius: r
            ,mass: 5
            ,x: ((height - ballHeight)*width/height) + (r/Math.sin(Math.atan(height/width)))
            ,y: viewHeight - ballHeight
            ,styles: {
                angleIndicator: '#000',
                fillStyle: '#ffea00'
            }
        });

        // add things to the world
        world.add(ramp);
        world.add( b );
        world.add([
            mppsvi,
            Physics.behavior('body-impulse-response')
            ,edgeBounce
            ,Physics.behavior('constant-acceleration'
                ,{
                acc: { x : 0, y: 9.8 }
            })
            ,Physics.behavior('body-collision-detection')
            ,Physics.behavior('sweep-prune')
        ]);
        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
            world.pause();

            var sigfig = 1000;
            var metrePerSecond = world.metre / 1000;
            var velocity = Math.round((b.state.vel.norm()/ metrePerSecond)*sigfig)/sigfig;
            var height = world.getSimHeight(b.state.pos.y);
            document.getElementById('velocity').innerHTML = velocity;
            document.getElementById('acceleration').innerHTML = Math.round((b.state.acc.norm())*sigfig)/sigfig;
            document.getElementById('PotentialEnergy').innerHTML = Math.round(height* b.mass * 9.8*sigfig)/sigfig;
            document.getElementById('KineticEnergy').innerHTML = Math.round(.5 * b.mass * (Math.pow(velocity,2))*sigfig)/sigfig;
            if(b.state.pos && b.state.pos.y && height < 1.1 ){
                if(!world.isPaused()){
                    world.pause();
                }
            }

        });
        document.getElementById("resetBtn").onclick = function (){
            console.log("clicked");
        }
        // start the ticker
        Physics.util.ticker.start();
    });

});

