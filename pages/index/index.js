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
  clear() {
    this.setData({
      link: '',
      noteData: null
    })
  },
  async saveImg(imgPath) {
    const userSetting = await wx.getSetting();
    if(!userSetting.authSetting['scope.writePhotosAlbum']) {
      try {
        await wx.authorize({ scope: 'scope.writePhotosAlbum' })
        try {
          await wx.saveImageToPhotosAlbum({ filePath: imgPath })
          await wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } catch(err) {
          await wx.showToast({
            title: '保存失败',
            icon: 'error'
          })
        }
      }catch {
        await wx.showModal({
          title: '提示',
          content: '请打开添加到相册权限',
          showCancel: false,
          success: async() => {
            const res = await wx.openSetting();
            if(!res.authSetting['scope.writePhotosAlbum']) {
              return wx.showToast({
                title: '已拒绝权限',
                icon: 'error'
              })
            }
            try {
              await wx.saveImageToPhotosAlbum({ filePath: imgPath })
              await wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
            } catch(err) {
              await wx.showToast({
                title: '保存失败',
                icon: 'error'
              })
            }
          }
        })
      }
    }else{
      try {
        await wx.saveImageToPhotosAlbum({ filePath: imgPath })
        await wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch(err) {
        await wx.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    }
  },
  showActionList(e) {
    wx.showActionSheet({
      itemList: ['保存到本地相册'],
      success: () => {
        const img = e.target.dataset.img;
        // 下载图片
        wx.downloadFile({
          url: `https:${img}`,
          success: async (res) => {
            if (res.statusCode === 200) this.saveImg(res.tempFilePath)
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
    url = url.replace('http:', 'https:')
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
