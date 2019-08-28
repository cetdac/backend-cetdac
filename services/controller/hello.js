module.exports = {
  hello: async function(ctx, next) {
    ctx.status = 200;
    try{
      ctx.body = 'world'
    }
    catch(e){
      console.error(e)
    }
  }
}