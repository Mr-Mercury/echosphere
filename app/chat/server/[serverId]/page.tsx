
async function ServerPage({ params, }: {params:{id:string}}) {

    // TODO: Pass channels to ChannelSideBar, 
    // Pass server content to serverChat
    // Fuck it I'll store everything in state. 
    return (<div>SERVER
        {/* <section>
            <ChannelSideBar channels={server.channels} server={server.id}/>
        </section>
        <PageContainer>
            <ChatWindow />
        </PageContainer> */}
    </div>)
}


export default ServerPage; 
