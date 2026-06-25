import Link from "next/link";
import { HeartIcon, ShareIcon, MessageIcon, SendIcon } from "@/components/app/icons";

export default function DiscoverScreen() {
  return (
    <div className="flex flex-col gap-2 py-[5px]">
      <article className="flex flex-col items-center gap-[5px] bg-white p-[10px] shadow-[0px_2px_2px_rgba(205,205,205,0.25)]">
        {/* Title + actions */}
        <div className="flex w-full flex-col gap-[2px]">
          <div className="flex h-[55px] items-center gap-2.5 border-b-2 border-brand py-2.5">
            <h2 className="flex-1 text-xl font-bold text-[#292929]">
              Traditional Ravioli Recipe
            </h2>
            <div className="flex items-center gap-1.5 text-brand">
              <button type="button" aria-label="Like">
                <HeartIcon className="size-7" />
              </button>
              <button type="button" aria-label="Share">
                <ShareIcon className="size-7" />
              </button>
            </div>
          </div>
          <p className="text-sm text-muted">20th November 2024</p>
        </div>

        {/* Post body */}
        <div className="flex w-full flex-col gap-[15px] py-5">
          <div className="relative h-[226px] w-full overflow-hidden rounded-[5px]">
            <div className="grid size-full place-items-center bg-[#e9ecf2] text-5xl">
              🍝
            </div>
            <Link
              href="/recipe/1"
              className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-center bg-brand text-xl font-bold text-white"
            >
              Go to Recipe!
            </Link>
          </div>

          <div className="flex flex-col gap-4 text-base text-[#292929]">
            <p>
              If you&rsquo;re craving authentic Italian comfort food, homemade
              ravioli is the way to go. This traditional recipe is easy to follow
              and results in soft, flavourful pasta that&rsquo;s perfect for any
              occasion.
            </p>
            <p>
              Making ravioli from scratch might seem intimidating, but it&rsquo;s
              totally worth it. The freshness of homemade pasta and the
              satisfaction of making it yourself make every bite special.
            </p>
            <p>
              Ready to give it a try? Follow the link above to get started and
              make your own homemade ravioli today!
            </p>
          </div>

          <p className="flex gap-[15px] text-base text-[#292929]">
            <span className="font-bold">Tags:</span>
            <span className="italic">Recipes</span>
          </p>
        </div>

        {/* Author */}
        <div className="flex w-full flex-col items-center border-y-2 border-brand py-2.5">
          <div className="flex w-full items-stretch gap-5 py-[15px]">
            <div className="flex w-[55px] flex-col items-center gap-5">
              <Link
                href="/user"
                className="grid size-[55px] place-items-center rounded-full bg-brand/15 text-lg font-bold text-brand"
              >
                CH
              </Link>
              <div className="flex flex-1 flex-col items-center justify-between text-brand">
                <button type="button" aria-label="Like">
                  <HeartIcon className="size-7" />
                </button>
                <button type="button" aria-label="Message">
                  <MessageIcon className="size-7" />
                </button>
                <button type="button" aria-label="Share">
                  <ShareIcon className="size-6" />
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-xl font-bold text-brand">Courtney Henry</p>
              <p className="text-base italic text-[#292929]">
                I&rsquo;m passionate about cooking and love experimenting with
                flavours and ingredients. I create simple, delicious recipes with
                easy-to-follow instructions, inspiring others to try new dishes
                in their kitchens.
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <section className="flex w-full flex-col gap-[5px] px-[5px]">
          <h3 className="text-xl font-bold text-[#292929]">Comments</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-[15px] rounded-[5px] bg-[#f6f7fa] p-2.5">
              <span className="grid size-[35px] shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                AM
              </span>
              <div className="flex flex-1 flex-col gap-[5px] py-[5px]">
                <p className="font-semibold text-brand">Arlene McCoy</p>
                <p className="text-sm text-[#292929]">
                  Simple recipe, turned out yummy!
                </p>
                <p className="text-sm text-muted">10:30AM - 27/11/2024</p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-[45px] items-center justify-center bg-brand text-xl font-semibold text-white"
            >
              Show More
            </button>
            <form className="flex items-center gap-1.5 rounded-[5px] bg-[#f6f7fa] px-2.5 py-[5px]">
              <input
                className="flex-1 bg-transparent py-[5px] text-base font-bold text-[#292929] outline-none placeholder:text-muted"
                placeholder="Write a comment!"
                aria-label="Write a comment"
              />
              <button type="submit" aria-label="Send comment" className="text-brand">
                <SendIcon className="size-6" />
              </button>
            </form>
          </div>
        </section>
      </article>
    </div>
  );
}
