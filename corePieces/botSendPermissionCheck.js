module.exports = {
    canSendMessages: m=>{
        if(m.guild){
            const permissionsForChannel = m.channel.permissionsFor(m.guild.members.cache.get(m.client.user.id));
    
            //We struck a forum thread, so we're gonna assume permissions are true, because lemonbot can send error messages there anyway XP
            if(permissionsForChannel === null) return true;
    
            return permissionsForChannel.has('SendMessages');
        }
    }
}