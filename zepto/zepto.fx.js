/**
 * Zepto.fx.js
 *
 * ���������Zepto��װ�Ĳ��animate������
 *  1�� ������������Ի�ȡǰ׺��������cssReset����������ǰ����ǰ׺��
 *  2��$.fn.animate ����Ҫ������ʵ���жϲ����������������õ�$.fn.anim���ǲ��������ĺ��ķ�����
 * (c) 2010-2015 Thomas Fuchs
 * Zepto.js may be freely distributed under the MIT license.
 * @param {Object} $
 * @param {Object} undefined
 */
;(function($, undefined) {
    var prefix = '',
        eventPrefix, // prefix�����ǰ׺ -webkit�ȣ�eventPrefix�¼�ǰ׺
        vendors = {
            Webkit: 'webkit',
            Moz: '',
            O: 'o'
        }, //ǰ׺����Դ ������IE
        testEl = document.createElement('div'), //��ʱDIV����
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i, //���μ��
        transform, //����
        transitionProperty, transitionDuration, transitionTiming, transitionDelay, //����
        animationName, animationDuration, animationTiming, animationDelay, //����
        cssReset = {}

    //���շ��ַ���ת��css���ԣ���aB-->a-b
    function dasherize(str) {
        return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()
    }

    //�����¼���
    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase()
    }

    /**
     * ����������ںˣ�����CSSǰ׺���¼�ǰ׺
     * ��-webkit�� css��-webkit-  event:webkit
     * �������vendors�洢webkit��moz��o����ǰ׺
     */
    $.each(vendors, function(vendor, event) {
        if(testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-'
            eventPrefix = event
            return false
        }
    })

    transform = prefix + 'transform' //����

    //����,����css������������ǰ׺
    cssReset[transitionProperty = prefix + 'transition-property'] =
        cssReset[transitionDuration = prefix + 'transition-duration'] =
            cssReset[transitionDelay = prefix + 'transition-delay'] =
                cssReset[transitionTiming = prefix + 'transition-timing-function'] =
                    cssReset[animationName = prefix + 'animation-name'] =
                        cssReset[animationDuration = prefix + 'animation-duration'] =
                            cssReset[animationDelay = prefix + 'animation-delay'] =
                                cssReset[animationTiming = prefix + 'animation-timing-function'] = ''

    /**
     * ������������Դ��Ĭ������
     * @type {{off: boolean, speeds: {_default: number, fast: number, slow: number}, cssPrefix: string, transitionEnd: *, animationEnd: *}}
     */
    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined), //��������Ƿ�֧�ֶ������������Ƿ�֧�ֹ��ɣ�֧�ֹ����¼�
        speeds: {
            _default: 400,
            fast: 200,
            slow: 600
        },
        cssPrefix: prefix, //css ǰ׺  ��-webkit-
        transitionEnd: normalizeEvent('TransitionEnd'), //���ɽ����¼�
        animationEnd: normalizeEvent('AnimationEnd') //�������Ž����¼�
    }

    /**
     * �����Զ��嶯��
     * @param properties  ��ʽ��
     * @param duration �����¼�
     * @param ease    ����
     * @param callback  ���ʱ�Ļص�
     * @param delay     �����ӳ�
     * @returns {*}
     */
    // �����ǶԲ����������ʹ���������������anim����
    $.fn.animate = function(properties, duration, ease, callback, delay) {
        //��������������Ϊfunction(properties,callback)
        if($.isFunction(duration))
            callback = duration, ease = undefined, duration = undefined
        if($.isFunction(ease)) //����Ϊfunction(properties,duration��callback)
            callback = ease, ease = undefined
        if($.isPlainObject(duration)) //����Ϊfunction(properties,����)
            ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
        // duration ���֣�����ʱ��  �ַ�����ȡspeeds: { _default: 400, fast: 200, slow: 600 }��Ӧ����
        if(duration) duration = (typeof duration == 'number' ? duration :
            ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000 //��������ʱ��Ĭ��ֵ
        if(delay) delay = parseFloat(delay) / 1000 //�ӳ�ʱ�䣬����1000ת����s
        return this.anim(properties, duration, ease, callback, delay)
    }

    /**
     * �������ķ���
     * @param properties  ��ʽ��
     * @param duration �����¼�
     * @param ease    ����
     * @param callback  ���ʱ�Ļص�
     * @param delay     �����ӳ�
     * @returns {*}
     */
    $.fn.anim = function(properties, duration, ease, callback, delay) {
        var key, cssValues = {},
            cssProperties, transforms = '', // transforms ����   cssValues���ø�DOM����ʽ
            that = this,
            wrappedCallback, endEvent = $.fx.transitionEnd,
            fired = false

        //��������ʱ��
        if(duration === undefined) duration = $.fx.speeds._default / 1000
        if(delay === undefined) delay = 0

        //����������֧�ֶ���������ʱ����Ϊ0��ֱ������������
        if($.fx.off) duration = 0

        // properties�Ƕ�����
        if(typeof properties == 'string') {
            // keyframe [animationName] = properties
            cssValues[animationName] = properties
            cssValues[animationDuration] = duration + 's'
            cssValues[animationDelay] = delay + 's'
            cssValues[animationTiming] = (ease || 'linear')
            endEvent = $.fx.animationEnd //���������¼�
        } else { //properties ����ʽ��
            cssProperties = []
            // CSS transitionsanimation
            cssValues
            for(key in properties)
                // supportedTransforms.test(key) �������Ƿ�Ϊ����
                // key + '(' + properties[key] + ') 'ƴ�ճɱ��η���
                if(supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
                else cssValues[key] = properties[key], cssProperties.push(dasherize(key))
            console.log(transforms)

            // ����ͳһ����  cssValues   cssProperties
            if(transforms) cssValues[transform] = transforms, cssProperties.push(transform)

            // duration > 0���Բ��Ŷ�������properties�Ƕ��󣬱���Ϊ���ɣ��������ַ�������Ϊanimate
            if(duration > 0 && typeof properties === 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionDelay] = delay + 's'
                cssValues[transitionTiming] = (ease || 'linear') //Ĭ����������
            }
        }

        //������ɺ����Ӧ����
        wrappedCallback = function(event) {
            if(typeof event !== 'undefined') {
                if(event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, wrappedCallback)
            } else
                $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

            fired = true
            // TODO ��Ȼ�Ѿ�ִ�����ˣ�Ϊʲô����Ҫ�ظ�cssһ�£���̫���
            $(this).css(cssReset)
            callback && callback.call(this)
        }

        //�����������¼�
        if(duration > 0) {
            //�󶨶��������¼�
            this.bind(endEvent, wrappedCallback)
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired

            //��ʱms��ִ�ж�����ע���������25ms������endEvent��������ִ���ꡣ
            //�󶨹��¼�������ʱ������transitionEnd��older Android phones��һ������
            setTimeout(function() {
                //������������Ͳ�����
                if(fired) return
                wrappedCallback.call(that)
            }, ((duration + delay) * 1000) + 25)
        }

        // trigger page reflow so new elements can animate
        //��������ҳ�������ˢ��DOM���ý��������õĶ���������ȷ����
        //���� offsetTop��offsetLeft�� offsetWidth��offsetHeight��scrollTop��scrollLeft��scrollWidth��scrollHeight��clientTop��clientLeft��clientWidth��clientHeight��getComputedStyle() ��currentStyle��������Щ���ᴥ����������������DOM������Ⱦ��ƽʱҪ�����ܱ��⣬�����Ϊ�˶�����ʱ��Ч���ţ�����������������ˢ��DOM��
        // ��.length����һ��
        this.size() && this.get(0).clientLeft

        //������ʽ����������
        this.css(cssValues)

        // durationΪ0�����������֧�ֶ����������ֱ��ִ�ж���������ִ�лص���
        if(duration <= 0) setTimeout(function() {
            that.each(function() {
                wrappedCallback.call(this)
            })
        }, 0)

        return this;
    }

    testEl = null //ȥ������Ҫ�����ݴ洢��������������
})(Zepto)