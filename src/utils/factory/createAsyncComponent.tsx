/**
 * ComponentPublicInstance: 如果组件的具体类型无法获得，或者你并不关心组件的具体类型，那么可以使用 ComponentPublicInstance。这只会包含所有组件都共享的属性，比如 $el
 * AsyncComponentLoader: 定义动态导入异步组件的加载函数
 * defineAsyncComponent： 定义一个异步组件，它在运行时是懒加载的。参数可以是一个异步加载函数，或是对加载行为进行更具体定制的一个选项对象。
 */
import type {AsyncComponentLoader, Component, ComponentPublicInstance} from "vue"
import {noop} from "/@/utils"
import {Spin} from "ant-design-vue"

interface Options {
  /**
   * 组件大小
   */
  size?: "default" | "small" | "large";
  /**
   * 延迟显示加载效果的时间（防止闪烁）
   */
  delay?: number;
  timeout?: number;
  loading?: boolean;
  /**
   * 重试
   */
  retry?: boolean;
}

/**
 * 创建异步组件
 * @param loader 加载器
 * @param options 配置选项
 */
export function createAsyncComponent<
  T extends Component = {
      new(): ComponentPublicInstance
    }
>(loader: AsyncComponentLoader<T>, options: Options = {}) {
  const {
    size = "small",
    delay = 100,
    timeout = 30000,
    loading = false,
    retry = true} = options
  return defineAsyncComponent({
    loader,
    loadingComponent: loading ? <Spin spinning={true} size={size}/> : undefined,  // spinning是一个boolean类型  tsx语法所以可以这么写：spinning={true}
    // errorComponent,
    delay,
    timeout,
    // suspensible,
    onError: !retry ? noop : (error: Error, retry: () => void, fail: () => void, attempts: number) => {
      if(error.message.match(/feach/) && attempts <= 3) {
        // 重试获取错误，最多 3 次尝试
        retry()
      } else {
        // 失败
        fail()
      }
    }
  })
}