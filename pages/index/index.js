Page({
  data: {
    link: '',
    noteData: null
  },
  changeLink(e) {
    this.setData({
      link: e.detail.value
    })
  },
  showActionList(e) {
    console.log(e)
    wx.showActionSheet({
      itemList: ['保存到本地相册'],
      success (res) {
        const img = e.target.dataset.img;
        // 下载图片
        wx.downloadFile({
          url: `https://${img}`,
          success (res) {
            if (res.statusCode === 200) {
              // 保存图片
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                  })
                }
              })
            }
          }
        })
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
  getImgList() {
    let url;
    if(this.data.link.startsWith('http')) {
      url = this.data.link;
    }else{
      const link = this.data.link.match(/http(\S*)，复制/);
      if(link && link.length) {
        url = link[0].slice(0, -3)
      }else{
        wx.showToast({
          title: '请输入链接',
          icon: 'error'
        })
      }
    }
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        const html = res.data;
        try{
          const jsonStr = html.match(/<script>window.__INITIAL_STATE__=([\s|\S]*)<\/script>/)[0].slice(33, -9);
          const data = JSON.parse(jsonStr);
          data.data.noteData.imageList = data.data.noteData.imageList.map(item => {
            item.url = item.url.replace(item.fileId, item.traceId);
            return item;
          })
          this.setData({
            noteData: data.data
          })
        }catch(e){
          wx.showToast({
            title: '解析失败',
            icon: 'error'
          })
        }
      },
      fail(error) {
        console.log(error)
      }
    })
  }
})
