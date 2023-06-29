let express = require('express');
const axios = require('axios');
const res = require('express/lib/response');
const errwin = /[\\\n\r/:*?\"<>|]/g;
const subwin = ``;
const httpurl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
// 获取XB参数
const getXB = require('../utils/x-bogus.js');
// 单作品接口
const aweme_url = 'https://www.douyin.com/aweme/v1/web/aweme/detail/?';
let router = express.Router();

// 获取作品ID
var GetID = async function (res, dyurl) {
  try {
    return await new Promise((resolve, reject) => {
      try {
        axios
          .get(dyurl, {
            headers: {
              'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
            }
          })
          .then(function (response) {
            // console.log(response.request.res.responseUrl);
            var revideo = /video\/(\d*)/;
            var item_ids = revideo.exec(response.request.res.responseUrl)[1];
            console.log('作品id  ' + item_ids);
            resolve(item_ids);
          })
          .catch(function (error) {
            console.log(error + '  item_ids获取错误');
            res.render('error');
            reject(error);
          });
      } catch (error_1) {
        console.log('获取作品ID失败   ' + error_1);
      }
    });
  } catch (error_2) {
    console.log(error_2);
    res.render('error');
    reject(error_2);
  }
};

// 获取作品信息
var GetInfo = async function (res, item_ids, dycookie) {
  try {
    return await new Promise((resolve, reject) => {
      const params_url = `aweme_id=${item_ids}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`;
      let xb = getXB(params_url);
      console.log(aweme_url + params_url + `&X-Bogus=${xb}`);
      axios
        .get(aweme_url + params_url + `&X-Bogus=${xb}`, {
          headers: {
            cookie: `odin_tt=${dycookie['odin_tt']};sessionid_ss=${dycookie['sessionid_ss']};ttwid=${dycookie['ttwid']};passport_csrf_token=${dycookie['passport_csrf_token']};msToken=${dycookie['msToken']};`,
            referer: 'https://www.douyin.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
          }
        })
        .then(function (response) {
          console.log('GetInfo ok');
          let { status_code } = response.data;
          // console.log(response)
          if (status_code === 0) {
            // 无水印视频链接
            // let url = item_list.video.play_addr.url_list[0].replace(
            //     'playwm',
            //     'play'
            // )
            // let url = response.data.aweme_detail.video.play_addr.url_list[2]
            let uri = response.data.aweme_detail.video.play_addr.uri;
            let music = response.data.aweme_detail.music.play_url.uri;
            let m_title = response.data.aweme_detail.music.title;
            let unique_id = response.data.aweme_detail.author.unique_id;
            let video_id = response.data.aweme_detail.aweme_id;
            let aweme_type = response.data.aweme_detail.aweme_type;
            let nickname = response.data.aweme_detail.author.nickname;
            let cover = response.data.aweme_detail.video.cover.url_list[0];
            let userhome = 'https://www.douyin.com/user/' + response.data.aweme_detail.author.sec_uid;
            let newimages = Array();
            // 没有设置抖音号则获取短号
            if (unique_id == '') {
              unique_id = response.data.aweme_detail.author.short_id;
            }
            if (aweme_type == '0') {
              var type = '视频';
              var images = '';
            } else {
              var type = '图集';
              var images = response.data.aweme_detail.images;
              for (var i in images) {
                newimages.push(images[i].url_list[0]);
              }
            }
            // 转换成1080p
            url = `http://aweme.snssdk.com/aweme/v1/play/?video_id=${uri}&ratio=1080p`;
            // 视频文案过滤非法字符
            let desc = response.data.aweme_detail.desc.replaceAll(errwin, subwin);

            console.log('video play url  ', url);
            console.log('video desc  ', desc);
            var data = {
              url: url,
              cover: cover,
              desc: desc,
              music: music,
              m_title: m_title,
              nickname: nickname,
              unique_id: unique_id,
              video_id: video_id,
              userhome: userhome,
              type: type,
              images: newimages
            };
            resolve(data);
          } else {
            console.log(status_code);
            reject(status_code);
          }
        })
        .catch(function (error) {
          console.log(error);
          res.render('error');
          reject(error);
        });
    });
  } catch (error_1) {
    console.log(error_1);
    res.render('error');
    reject(error_1);
  }
};

/* GET api. */
router.get('/', async function (req, res, next) {
  try {
    let dycookie = req.cookies['dycookie'];
    console.log(dycookie);

    if (dycookie == undefined) {
      dycookie = {
        odin_tt: '5b44bc1917b3c9dbeb22c5421e9045cb66ba69350688c40dd31eb0abe30de84bf5955b0c5afa91349c5087af762519d0',
        passport_csrf_token: '571cd5fe5563fea20e9c6294efbb7eba',
        sessionid_ss: '453150100a789455260b476ca29ab907',
        ttwid: '1%7CfbElSNCaIB87pCreNiG-IlX1HFTmH3MecM4XZckbxxI%7C1678925357%7Cd1c31c574371fb03b97ee48dd6e0ff7bbc079beedab2a83a8bec5994e51ffbde',
        msToken: 'uTa38b9QFHB6JtEDzH9S4np17qxpG6OrROHQ8at2cBpoKfUb0UWmTkjCSpf72EcUrJgWTIoN6UgAv5BTXtCbOAhJcIRKyZIT7TMYapeOSpf'
      };

      // var data = ({
      //     work:false
      // })
      // res.render('index', data);
      // return
    }

    if (req.query.url == '') {
      // 默认视频
      req.query.url = 'https://v.douyin.com/NKyY6Ch/';
    }

    console.log('open shorturl ok');

    let dyurl = req.query.url;
    const item_ids = await GetID(res, dyurl);

    const data = await GetInfo(res, item_ids, dycookie);
    // console.log(JSON.stringify(data));
    res.render('index', { data });

    console.log('open url ok');
  } catch (error) {
    res.render('error');
  }
});

module.exports = router;
